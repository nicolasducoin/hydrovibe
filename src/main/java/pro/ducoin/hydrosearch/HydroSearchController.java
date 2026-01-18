package pro.ducoin.hydrosearch;


import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.apache.commons.io.FileUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.model.mistralai.MistralAiChatModel;
import dev.langchain4j.model.mistralai.MistralAiChatModelName;


@RestController
public class HydroSearchController {
    	
	@CrossOrigin("*")
	@GetMapping("/searchparams")
	public HydroSearchParameters hydroSearchParameters(@RequestParam(value = "requestString", defaultValue = "None") String requestString) {
		return getParamsFromRequestSentence(requestString);
	}


	private HydroSearchParameters getParamsFromRequestSentence(String requestString)   {

        ChatModel model = MistralAiChatModel.builder()
                .apiKey(ApiKeys.MISTRALAI_API_KEY)
                .modelName(MistralAiChatModelName.MISTRAL_LARGE_LATEST)
                .build();

		String[] collectionsIds = getCollectionsIdsFromSentence(model, requestString);
		

		return getOtherInformationsAndCreateSearchParameters(model, collectionsIds, requestString);
	}

	private HydroSearchParameters getOtherInformationsAndCreateSearchParameters(ChatModel model, String[] collectionsIds, String requestString) {


		String instructionForDateAndLocation = """
Generate a json string from the text to come. This json must me on one line without any decoration (only the json string should be returned and nothing else) and must have the following syntax : 
{
          "bbox": [
            "Detected coordinate xll",
            "Detected coordinate yll",
            "Detected coordinate xur",
            "Detected coordinate yur",
          ],
          "start_datetime": "interval lower date",
          "end_datetime": "interval upper date"
}

if specified, the bbox is defined this way otherwise the attribute should not appear : 
"Detected coordinate xll" is the lower left longitude of the bounding box as a float
"Detected coordinate yll" is the lower left latitude of the bounding box as a float
"Detected coordinate xur" is the upper right longitude of the bounding box as a float
"Detected coordinate yur" is the upper right latitude of the bounding box as a float

All places names should be detected as towns, lakes, rivers, regions, countries, etc.
For the pyrenees it could give for the bbox:
"bbox": [ -2.406022,41.630687,3.327998,43.683434]

If specified, the "interval upper date" is the higher date&time
If specified, the "interval lower date" is the lower date&time
If there is no date information do not add date interval
For "summer 2024", it would give for the query:
"start_datetime":"2024-06-20T00:00:00.000Z"  ,"end_datetime": "2024-09-21T23:59:59.000Z"
				""";
		ChatMessage instructionsForCollectionsChatMessage = SystemMessage.from(instructionForDateAndLocation);
		ChatMessage userRequestChatMessage = new UserMessage(requestString);
		ChatResponse response = model.chat(instructionsForCollectionsChatMessage, userRequestChatMessage);

		String responseString = response.aiMessage().text();

		responseString = responseString.replaceAll("`","");
		DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSX");


		if(responseString.startsWith("json")) {
			responseString = responseString.substring("json".length()+1);
		}

		System.out.println("Response String for params : " + responseString);
        
        JSONObject responseStringAJsonObject = new JSONObject(responseString);
		System.out.println("1");
		String[] boundingBox = null;
		if (responseStringAJsonObject.has("bbox")) {
			JSONArray bboxCoordinates = responseStringAJsonObject.getJSONArray("bbox");
			boundingBox = new String[4];
			for(int i=0 ; i<4 ; i++) {
				boundingBox[i] = bboxCoordinates.get(i).toString();
			}
		}
		System.out.println("2");
		
		LocalDateTime start_datetime = null;
		if (responseStringAJsonObject.has("start_datetime")) {
		String start_datetimeAsString = responseStringAJsonObject.getString("start_datetime");
			if(start_datetimeAsString != null && !"".equals(start_datetimeAsString)) {
				start_datetime = LocalDateTime.parse(start_datetimeAsString, dateTimeFormatter);
			}
		}

		System.out.println("3");
		
		LocalDateTime end_datetime = null;
		if (responseStringAJsonObject.has("end_datetime")) {
			String end_datetimeAsString = responseStringAJsonObject.getString("end_datetime");
			if(end_datetimeAsString != null && !"".equals(end_datetimeAsString)) {
				end_datetime = LocalDateTime.parse(end_datetimeAsString, dateTimeFormatter);
			}
		}
		
		System.out.println("4");

		return new HydroSearchParameters(collectionsIds, start_datetime, end_datetime, boundingBox);
	}

	private String[] getCollectionsIdsFromSentence(ChatModel model, String requestString) {
		String instructionsForCollections = """
Bellow is a dictionnary of collections of satellite products. 

From the promt to come, filter the matching collections, and return it as comma separated list of ids. Just give the result on one line with no decoration. All informations not relevant for collection filtering should be ingnored. Unrelevant informations can be time, place, or informations that can't be used to discriminate these collections. 

A few example :
"Total water over England" --> "GRAVIMETRY_TOTAL_WATER"
since it is the only collection showing "total land water"

"Lakes water level in jully 2023" --> "HYDROWEB_LAKES_RESEARCH, SWOT_L2_HR_LAKESP_OBS, SWOT_L2_HR_LAKESP_PRIOR, HYDROWEB_LAKES_OPE"
SWOT_PRIOR_LAKE_DATABASE is not included since it gives only the lakes shapes, not the water hight

"snow over the Alpes" --> "LIS_SNT_YEARLY"
since this is the only collection giving informations on snow

"Water underground reserves" --> ""
since there are no matching collection

The dictionary:
				""";


				
    	ClassLoader classLoader = getClass().getClassLoader();
 		File collectionsDefinitionFile = new File(classLoader.getResource("collections.json").getFile());
    	try {
			String collectionsDefinitionString = FileUtils.readFileToString(collectionsDefinitionFile, "UTF-8");
			instructionsForCollections += collectionsDefinitionString;
		} catch (IOException e) {
			e.printStackTrace();
			return null;
		}


		ChatMessage instructionsForCollectionsChatMessage = SystemMessage.from(instructionsForCollections);
		ChatMessage userRequestChatMessage = new UserMessage(requestString);
		ChatResponse response = model.chat(instructionsForCollectionsChatMessage, userRequestChatMessage);

		String responseString = response.aiMessage().text();

		System.out.println("Response String for collections : " + responseString);

		String[] idsArray = {};
		if(responseString!=null && !"".equals(responseString)) {
			idsArray = responseString.split(",", 0);
		}

		return idsArray;
	}

}

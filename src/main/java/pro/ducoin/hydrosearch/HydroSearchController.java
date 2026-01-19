package pro.ducoin.hydrosearch;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "HydroSearch", description = "AI-powered search API for hydrology products")
public class HydroSearchController {
    
    private final HydroSearchService hydroSearchService;
    
    @Autowired
    public HydroSearchController(HydroSearchService hydroSearchService) {
        this.hydroSearchService = hydroSearchService;
    }
    	
	@CrossOrigin("*")
	@Operation(
		summary = "Search for hydrology products",
		description = "Uses AI to extract search parameters (collections, dates, bounding box) from natural language queries"
	)
	@ApiResponses(value = {
		@ApiResponse(
			responseCode = "200",
			description = "Successfully extracted search parameters",
			content = @Content(schema = @Schema(implementation = HydroSearchParameters.class))
		),
		@ApiResponse(
			responseCode = "400",
			description = "Invalid request - requestString parameter is required and cannot be empty",
			content = @Content(schema = @Schema(implementation = ErrorResponse.class))
		),
		@ApiResponse(
			responseCode = "500",
			description = "Internal server error",
			content = @Content(schema = @Schema(implementation = ErrorResponse.class))
		)
	})
	@GetMapping("/searchparams")
	public HydroSearchParameters hydroSearchParameters(
			@Parameter(description = "Natural language query describing the hydrology product you're looking for (e.g., 'Lakes water level in July 2023 over France')", required = true)
			@RequestParam(value = "requestString", required = true) String requestString) {
		if (requestString == null || requestString.trim().isEmpty() || "None".equals(requestString)) {
			throw new IllegalArgumentException("requestString parameter is required and cannot be empty");
		}
		return hydroSearchService.getParamsFromRequestSentence(requestString);
	}
	
	@ExceptionHandler(IllegalArgumentException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ErrorResponse handleIllegalArgumentException(IllegalArgumentException e) {
		return new ErrorResponse("BAD_REQUEST", e.getMessage());
	}
	
	@ExceptionHandler(Exception.class)
	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	public ErrorResponse handleException(Exception e) {
		return new ErrorResponse("INTERNAL_SERVER_ERROR", "An error occurred while processing the request: " + e.getMessage());
	}

}

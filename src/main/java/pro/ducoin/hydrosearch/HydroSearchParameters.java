package pro.ducoin.hydrosearch;

import java.time.LocalDateTime;

public record HydroSearchParameters(String[] collections, LocalDateTime startDate, LocalDateTime endDate, String[] boundingBox) {}

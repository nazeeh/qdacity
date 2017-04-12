package com.qdacity.endpoint.inputconverter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class IdCsvStringToLongList {

    private final static String SPLIT_REGEX = "\\s*,\\s*";

    public static List<Long> convert(String idString) {
	if (idString != null) {
	    List<String> idArr = Arrays.asList(idString.split(SPLIT_REGEX));
	    List<Long> idList = new ArrayList<>();
	    for (String string : idArr) {
		idList.add(Long.parseLong(string));
	    }
	    return idList;
	} else {
	    return new ArrayList<>();
	}
    }
}

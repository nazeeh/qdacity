package com.qdacity.endpoint.datastructures;

import java.io.Serializable;

import com.qdacity.project.codesystem.Code;
import com.qdacity.project.data.TextDocument;

public class TextDocumentCodeContainer implements Serializable {

    public TextDocument textDocument;
    public Code code;

}

package com.qdacity.endpoint.datastructures;

import com.qdacity.project.codesystem.Code;
import com.qdacity.project.data.TextDocument;
import java.io.Serializable;

public class TextDocumentCodeContainer implements Serializable {

    public TextDocument textDocument;
    public Code code;

}

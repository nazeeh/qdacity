package com.qdacity.endpoint.datastructures;

import com.google.appengine.api.datastore.Blob;

public class BlobWrapper {

    Blob blob;

    public BlobWrapper() {
    }

    public BlobWrapper(Blob blob) {
        this.blob = blob;
    }

    public Blob getBlob() {
        return blob;
    }

    public void setBlob(Blob blob) {
        this.blob = blob;
    }
}

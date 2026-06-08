package com.legacybridge.model;

public class Comparison {
    private String old;
    private String next;

    public Comparison() {}

    public Comparison(String old, String next) {
        this.old = old;
        this.next = next;
    }

    public String getOld() {
        return old;
    }

    public void setOld(String old) {
        this.old = old;
    }

    public String getNext() {
        return next;
    }

    public void setNext(String next) {
        this.next = next;
    }
}

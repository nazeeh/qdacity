package com.qdacity.user;

import javax.jdo.annotations.*;
import java.util.ArrayList;
import java.util.List;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class UserGroup {

    @PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    long id;

    @Persistent
    String name;

    @Persistent
    List<String> owners;

    @Persistent
    List<String> participants;

    public UserGroup() {    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public List<String> getOwners() {
        if(owners == null) return new ArrayList<String>();
        return owners;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setOwners(List<String> owners) {
        this.owners = owners;
    }

    public List<String> getParticipants() {
        if(participants == null) return new ArrayList<String>();
        return participants;
    }

    public void setParticipants(List<String> participants) {
        this.participants = participants;
    }
}

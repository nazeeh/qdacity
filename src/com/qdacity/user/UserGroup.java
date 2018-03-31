package com.qdacity.user;

import javax.jdo.annotations.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class UserGroup implements Serializable {

    @PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    Long id;

    @Persistent
    String name;

    @Persistent
    List<String> owners;

    @Persistent
    List<String> participants;

    @Persistent
    List<String> projects;

    public UserGroup() {    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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

    public List<String> getProjects() {
        if(projects == null) return new ArrayList<String>();
        return projects;
    }

    public void setProjects(List<String> projects) {
        this.projects = projects;
    }
}

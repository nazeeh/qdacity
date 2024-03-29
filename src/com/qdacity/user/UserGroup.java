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
    List<String> invitedParticipants;

    @Persistent
    List<Long> projects;

    @Persistent
    List<Long> courses;

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

    public List<Long> getProjects() {
        if(projects == null) return new ArrayList<Long>();
        return projects;
    }

    public void setProjects(List<Long> projects) {
        this.projects = projects;
    }

    public List<Long> getCourses() {
        if(courses == null) return new ArrayList<Long>();
        return courses;
    }

    public void setCourses(List<Long> courses) {
        this.courses = courses;
    }

    public List<String> getInvitedParticipants() {
        if(invitedParticipants == null) invitedParticipants = new ArrayList<>();
        return invitedParticipants;
    }

    public void setInvitedParticipants(List<String> invitedParticipants) {
        this.invitedParticipants = invitedParticipants;
    }
}

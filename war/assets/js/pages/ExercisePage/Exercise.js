export default class Exercise {
  constructor(exerciseID) {
    this.id = exerciseID;
    this.name = "";
    this.termCourseID = "";
    this.projectRevisionID = "";
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
  }

  getTermCourseID() {
    return this.termCourseID;
  }
}

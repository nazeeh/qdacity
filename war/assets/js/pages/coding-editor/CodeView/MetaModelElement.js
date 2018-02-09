export default class MetaModelElement {
  constructor(elementId, elementName, type, group) {
    this.id = elementId;
    this.name = elementName;
    this.type = type;
    this.group = group;
    this.generalizations = [];
    this.specializations = [];
    this.selected = false;
  }

  getId() {
    return this.id;
  }

  getGroup() {
    return this.group;
  }

  setGroup(group) {
    this.group = group;
  }

  setGeneralization(generalizations) {
    this.generalizations = generalization;
  }

  addGeneralization(generalization) {
    this.generalizations.push(generalization);
  }

  addSpecialization(generalization) {
    this.specializations.push(generalization);
  }

  hasGeneralization(generalization) {
    return this.generalizations.indexOf(generalization) != -1;
  }

  hasSpecialization(generalization) {
    return this.specializations.indexOf(generalization) != -1;
  }

  setSpecialization(specialization) {
    this.specializations = specialization;
  }

  getSpecialization() {
    this.specializations;
  }

  setSelected(value) {
    this.selected = value;
  }

  toggleSelected() {
    this.selected = this.selected == true ? false : true;
  }

  isSelected() {
    return this.selected;
  }
}

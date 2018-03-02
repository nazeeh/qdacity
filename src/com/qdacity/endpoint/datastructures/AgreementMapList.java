package com.qdacity.endpoint.datastructures;

import java.util.ArrayList;
import java.util.List;

public class AgreementMapList {

	public static class SimplifiedAgreementMap {

		private Long keyId;
		
		private Long parentKeyId;
		
		private Long positionInOrder;

		public Long getKeyId() {
			return keyId;
		}

		public void setKeyId(Long keyId) {
			this.keyId = keyId;
		}

		public Long getParentKeyId() {
			return parentKeyId;
		}

		public void setParentKeyId(Long parentKeyId) {
			this.parentKeyId = parentKeyId;
		}

		public Long getPositionInOrder() {
			return positionInOrder;
		}

		public void setPositionInOrder(Long positionInOrder) {
			this.positionInOrder = positionInOrder;
		}
	}
	
	
	private List<SimplifiedAgreementMap> agreementMapPositions;

	public AgreementMapList() {
		this.agreementMapPositions = new ArrayList<>();
	}
	
	public AgreementMapList(List<SimplifiedAgreementMap> agreementMapPositions) {
		this.agreementMapPositions = agreementMapPositions;
	}
	
	public List<SimplifiedAgreementMap> getAgreementMapPositions() {
		return agreementMapPositions;
	}

	public void setAgreementMapPositions(List<SimplifiedAgreementMap> agreementMapPositions) {
		this.agreementMapPositions = agreementMapPositions;
	}
}

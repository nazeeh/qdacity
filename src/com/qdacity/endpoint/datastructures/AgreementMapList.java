package com.qdacity.endpoint.datastructures;

import java.util.ArrayList;
import java.util.List;

import com.qdacity.project.data.AgreementMap;

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
	
	
	private List<SimplifiedAgreementMap> agreementMaps;

	public AgreementMapList() {
		this.agreementMaps = new ArrayList<>();
	}
	
	public AgreementMapList(List<SimplifiedAgreementMap> agreementMaps) {
		this.agreementMaps = agreementMaps;
	}
	
	public List<SimplifiedAgreementMap> getAgreementMaps() {
		return agreementMaps;
	}

	public void setAgreementMaps(List<SimplifiedAgreementMap> agreementMaps) {
		this.agreementMaps =agreementMaps;
	}
}

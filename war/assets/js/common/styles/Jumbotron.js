import styled from 'styled-components';

const Jumbotron = styled.div`
	border: 1px solid ${props => props.theme.borderDefault};
	padding: 20px 50px 20px 50px;
	margin-bottom: 20px;
	background-color: ${props => props.theme.defaultPaneBg};
	& > div {
		font-size: 18px;
	}
`;

export default Jumbotron;

//@ts-check
import React, {Component} from 'react';
import IntlProvider from '../../common/Localization/LocalizationProvider';
import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';

const StyledHeading = styled.h4`
    margin-bottom: 20px;
`;

const ImageChooseWrapper = styled.div`
    display: grid;
    grid-template-columns: 100px auto;
    grid-template-rows: auto auto auto;
    grid-gap: 5px;
`;

const ImagePreviewWrapper = styled.div`
    grid-column-start: 1;
    grid column-end: 2;

    grid-row-start: 1;
    grid-row-end: 3;
`;

const StyledUploadButtonWrapper = styled.div`
    grid-column-start: 2;
    grid column-end: 3;

    grid-row-start: 1;
    grid-row-end: 3;
`;

const StyledUploadButton = styled.button`
    max-width: 150px;

    margin-right: 45px !important;
    margin-top: 30px !important;
`;

const StyledFileInputWrapper = styled.div`
    grid-column-start: 1;
    grid column-end: 3;

    grid-row-start: 3;
    grid-row-end: 4;


    & > input {
        display: none;
    }
`;

const StyledFileInputLabel = styled.label`
    cursor: pointer;
`;

export default class ImageChooser extends Component {
	constructor(props) {
        super(props);
        
        this.state = {
            imgPath: '',
            imgBase64: this.props.initialImg
        }
    }

    onImageSelected(imgPath) {
		const { formatMessage } = IntlProvider.intl;

        if(imgPath.size > 350000) {
            vex.dialog.open({
                message: formatMessage({
                    id: 'image.chooser.sizeTooLarge',
                    defaultMessage: 'Your file has more than 350kb!'
                }),
                buttons: [
                    $.extend({}, vex.dialog.buttons.YES, {
                        text: formatMessage({
                            id: 'image.chooser.sizeTooLarge.ok',
                            defaultMessage: 'OK'
                        })
                    })
                ]
            });
            return;
        }

        const reader = new FileReader();
    
        reader.onloadend = () => {
          this.setState({
            imgPath: imgPath,
            imgBase64: reader.result
          });
        }
    
        reader.readAsDataURL(imgPath);
    }
    
    render() {
        return (
            <div>
                <StyledHeading>
                    <FormattedMessage
                        id="image.chooser.heading"
                        defaultMessage="Select image with max. 350kb"
                    />	
                </StyledHeading>
                <ImageChooseWrapper>
                    <ImagePreviewWrapper>
                        <img height='100px' width='100px' src={this.state.imgBase64}/>
                    </ImagePreviewWrapper>
                    <StyledUploadButtonWrapper>
                        <StyledUploadButton onClick={() => this.props.onSave(this.state.imgBase64)} className="vex-dialog-button vex-dialog-button-secondary">
                            <i className="fa fa-upload"/> Upload
                        </StyledUploadButton>
                    </StyledUploadButtonWrapper>
                    <StyledFileInputWrapper>
                        <StyledFileInputLabel htmlFor="image-input">
                            <i className="fa fa-hand-pointer"/> <FormattedMessage
                                                                    id="image.chooser.select"
                                                                    defaultMessage="Select image"
                                                                />	
                        </StyledFileInputLabel>
                        <input id="image-input" type="file" onChange={(e) => this.onImageSelected(e.target.files[0])} />
                    </StyledFileInputWrapper>
                </ImageChooseWrapper>
            </div>
        );
    }
}
//@ts-check
import React, {Component} from 'react';
import IntlProvider from '../../common/Localization/LocalizationProvider';
import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';

import ImageUtil from '../../common/auth/ImageUtil.js';

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

        if(!(imgPath.name.endsWith('.png') || imgPath.name.endsWith('.PNG') 
            || imgPath.name.endsWith('.jpg') || imgPath.name.endsWith('.JPG') 
            || imgPath.name.endsWith('.jpeg') || imgPath.name.endsWith('.JPEG'))) {
            // not an image
            const errorMsg = formatMessage({
                id: 'image.chooser.wrongFileEnding',
                defaultMessage: 'Only PNG and JPEG is supported as image format!'
            });

            vex.dialog.open({
                message: errorMsg,
                buttons: [
                    $.extend({}, vex.dialog.buttons.YES, {
                        text: formatMessage({
                            id: 'image.chooser.error.ok',
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

    async onUpload() {
        const scaledImgBase64 = await ImageUtil.scaleToBase64(this.state.imgBase64, 200, 200);
        this.props.onSave(scaledImgBase64);
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
                        <StyledUploadButton onClick={() => this.onUpload()} className="vex-dialog-button vex-dialog-button-secondary">
                            <i className="fa fa-upload"/> <FormattedMessage
                                                            id="image.chooser.upload"
                                                            defaultMessage="Upload"
                                                        />	
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
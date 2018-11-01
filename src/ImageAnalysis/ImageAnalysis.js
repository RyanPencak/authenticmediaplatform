import React, { Component } from 'react';
import loadingSpinner from '../Assets/loadingSpinner.gif'
import './ImageAnalysis.css';
import axios from 'axios';
import Dropzone from 'react-dropzone';
import {Grid, Col, Row, Button} from 'react-bootstrap';
import FilePreview from 'react-preview-file';

class ImageAnalysis extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      queryImage: null,
      topSites: {},
      image: null
    }

    this.onDropImage = this.onDropImage.bind(this);
    this.resetImage = this.resetImage.bind(this);
    this.ImageAnalysis = this.ImageAnalysis.bind(this);
    this.getTopSites = this.getTopSites.bind(this);
  }

  onDropImage(dropped_file) {
    this.setState({
      queryImage: dropped_file
    });
    let bodyFormData = new FormData();
    dropped_file.map((queryImg) => (
      bodyFormData.set('queryImg', queryImg)
    ))
    axios({
        method: 'post',
        url: 'http://localhost:5000/upload',
        data: bodyFormData,
        config: { headers: {'Content-Type': 'multipart/form-data' }}
      })
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      })
  }

  resetImage() {
    this.setState({
      queryImage: null
    })
  }

  ImageAnalysis() {
    this.setState({isLoading: true})
    axios({
        method: 'post',
        url: 'http://localhost:5000/analyze',
        config: { headers: {'Content-Type': 'application/json'}}
      })
      .then(({data}) => {
        this.setState({
          topSites: data,
          isLoading: false
        });
        console.log(this.state.data);
      })
      .catch(err => {
        console.log(err);
      })
  }


  getTopSites() {
    let buffer = [];
    buffer.push(
      <div key={0}>
        <h2>Image Found:</h2>
        <br />
        <h4><strong>Site 1: </strong> {this.state.topSites}</h4>
      </div>
    )
    return (
      <div className="report">
        {buffer}
      </div>
    );
  }

  render() {
      return (
        <div className="ImageAnalysis">
          <Grid>
            <Row className="show-grid">
              <Col>
                <div className="imageDrop">
                  <h3>Image to Analyze</h3>
                  <div className="import">
                    {
                      this.state.queryImage === null
                      ?
                      <Dropzone
                        className="dropZone"
                        accept="image/jpeg, image/jpg, image/png"
                        onDrop={this.onDropImage.bind(this)}>
                        <p>Drag image here or click to upload</p>
                      </Dropzone>
                      :
                      <div className="preview">
                        {this.state.queryImage.map((qImg) => (
                          <FilePreview file={qImg}>
                            {(preview) => <img
                              className="imagePreview"
                              src={preview}
                              alt="Query Preview"
                              key={qImg}
                            />}
                          </FilePreview>
                        ))}
                        <Button bsSize="xsmall" onClick={this.resetImage.bind(this)}>Remove Image</Button>
                      </div>
                    }
                  </div>
                </div>
              </Col>
            </Row>

            <Row className="show-grid">
              {
                this.state.queryImage !== null
                ?
                <div>
                  {
                    this.state.isLoading
                    ?
                    <img className="loading" src={loadingSpinner} alt='Loading...' />
                    :
                    <Button className="ImageAnalysisButton" bsSize="large" onClick={this.ImageAnalysis.bind(this)}>Analyze Image</Button>
                  }
                </div>
                :
                <Button className="ImageAnalysisButton" bsSize="large" onClick={this.ImageAnalysis.bind(this)} disabled>Analyze Image</Button>
              }
            </Row>

            <Row className="show-grid">
              {
                Object.keys(this.state.topSites).length !== 0
                ?
                <div>
                  {this.getTopSites()}
                </div>
                :
                null
              }
            </Row>

          </Grid>
        </div>
      );
  }
}

export default ImageAnalysis;

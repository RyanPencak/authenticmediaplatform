import React, { Component } from 'react';
import './ImageAnalysis.css';
import axios from 'axios';
import Dropzone from 'react-dropzone';
import {Grid, Col, Row, Button} from 'react-bootstrap';
import FilePreview from 'react-preview-file';

class ImageAnalysis extends Component {
  constructor(props) {
    super(props);

    this.state = {
      queryImage: null,
      topSites: {},
      elaImage: null
    }

    this.onDropImage = this.onDropImage.bind(this);
    this.resetImage = this.resetImage.bind(this);
    this.getHost = this.getHost.bind(this);
    this.getDomain = this.getDomain.bind(this);
    this.ImageAnalysis = this.ImageAnalysis.bind(this);
    this.getImageAnalysis = this.getImageAnalysis.bind(this);
  }

  onDropImage(dropped_file) {
    this.setState({
      queryImage: dropped_file
    });
  }

  resetImage() {
    this.setState({
      queryImage: null
    })
  }

  getHost(url) {
    let host;

    if (url.indexOf("//") > -1) {
        host = url.split('/')[2];
    }
    else {
        host = url.split('/')[0];
    }

    //find & remove port number
    host = host.split(':')[0];
    //find & remove "?"
    host = host.split('?')[0];

    return host;
  }

  getDomain(url) {
    var domain = this.getHost(url),
        splitURL = domain.split('.'),
        len = splitURL.length;

    if (len > 2) {
        domain = splitURL[len - 2] + '.' + splitURL[len - 1];
        if (splitURL[len - 2].length === 2 && splitURL[len - 1].length === 2) {
            domain = splitURL[len - 3] + '.' + domain;
        }
    }
    return domain;
  }

  ImageAnalysis() {
    let bodyFormData = new FormData();
    this.state.queryImage.map((queryImg) => (
      bodyFormData.set('queryImg', queryImg)
    ))

    axios({
        method: 'post',
        url: 'http://localhost:5000/imagesearch',
        data: bodyFormData,
        config: { headers: {'Content-Type': 'multipart/form-data' }}
      })
      .then(({data}) => {
        this.setState({
          topSites: data
        });
      })
      .catch(err => {
        console.log(err);
      })

      axios({
          method: 'post',
          url: 'http://localhost:5000/ela',
          responseType: 'arraybuffer',
          data: bodyFormData
        })
        .then((res) => {
          let img = new Buffer(res.data, 'binary').toString('base64')
          this.setState({
            elaImage: img
          });
        })
        .catch(err => {
          console.log(err);
        })
  }

  getImageAnalysis() {
    let imgsrc = 'data:image/jpeg;base64,' + this.state.elaImage;
    let buffer = [];
    const listItems = this.state.topSites.map((url) =>
      <li><a href={url}>{this.getDomain(url)}</a></li>
    );
    buffer.push(
      <div key={0}>
        <h2> <strong>ELA: </strong> </h2>
        <img className="elaImage" src={imgsrc} alt='ELA Output' />
        <br />
        <h2> <strong>Sites: </strong> </h2>
        <ul> {listItems} </ul>
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
                        {this.state.queryImage.map((qImg,idx) => (
                          <FilePreview file={qImg}>
                            {(preview) => <img
                              className="imagePreview"
                              src={preview}
                              alt="Query Preview"
                              key={preview}
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
                <Button className="ImageAnalysisButton" bsSize="large" onClick={this.ImageAnalysis.bind(this)}>Analyze Image</Button>
                :
                <Button className="ImageAnalysisButton" bsSize="large" onClick={this.ImageAnalysis.bind(this)} disabled>Analyze Image</Button>
              }
            </Row>

            <Row className="show-grid">
              {
                Object.keys(this.state.topSites).length !== 0
                ?
                <div>
                  {this.getImageAnalysis()}
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

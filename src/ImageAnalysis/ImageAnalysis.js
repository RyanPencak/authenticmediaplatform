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
      ela: {},
      image: null
    }

    this.onDropImage = this.onDropImage.bind(this);
    this.resetImage = this.resetImage.bind(this);
    this.ImageAnalysis = this.ImageAnalysis.bind(this);
    this.getImageAnalysis = this.getImageAnalysis.bind(this);
  }

  onDropImage(dropped_file) {
    this.setState({
      queryImage: dropped_file
    });
    // let bodyFormData = new FormData();
    // dropped_file.map((queryImg) => (
    //   bodyFormData.set('queryImg', queryImg)
    // ))
    // axios({
    //     method: 'post',
    //     url: 'http://localhost:5000/upload',
    //     data: bodyFormData,
    //     config: { headers: {'Content-Type': 'multipart/form-data' }}
    //   })
    //   .then(res => {
    //     console.log(res);
    //   })
    //   .catch(err => {
    //     console.log(err);
    //   })
  }

  resetImage() {
    this.setState({
      queryImage: null
    })
  }

  ImageAnalysis() {
    this.setState({isLoading: true})
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
        // for (let i = 0; i < data.length; i++) {
        //   console.log(data[i]);
        // }
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
          data: bodyFormData,
          config: { headers: {'Content-Type': 'multipart/form-data' }}
        })
        .then(({data}) => {
          // console.log(data);
          this.setState({
            ela: data
          });
        })
        .catch(err => {
          console.log(err);
        })
  }


  getELAoutput(url) {
    return axios.get(url, {responseType: 'arraybuffer'})
      .then(response => {
        let img = new Buffer(response.data, 'binary').toString('base64')
        this.setState ({
          image: img
        })
      })
  }


  getImageAnalysis() {
    this.getELAoutput('http://localhost:5000/getelaoutput');

    let imgsrc = 'data:image/jpeg;base64,' + this.state.image;
    let buffer = [];
    const listItems = this.state.topSites.map((site) =>
      <li>{site}</li>
    );

    buffer.push(
      <div key={0}>
        <img className="elaImage" src={imgsrc} alt='ELA Output' />
        <h2> <strong>ELA: </strong> </h2>
        <h4> {this.state.ela} </h4>
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
                        {this.state.queryImage.map((qImg,idx) => (
                          // console.log(qImg.lastModified)
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

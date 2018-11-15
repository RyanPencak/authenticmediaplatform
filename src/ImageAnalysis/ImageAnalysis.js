import React, { Component } from 'react';
import './ImageAnalysis.css';
import loadingSpinner from '../Assets/loadingSpinner.gif'
import axios from 'axios';
import Dropzone from 'react-dropzone';
import {Grid, Col, Row, Button, Jumbotron, Glyphicon} from 'react-bootstrap';
import FilePreview from 'react-preview-file';
import Scrollchor from 'react-scrollchor';

class ImageAnalysis extends Component {
  constructor(props) {
    super(props);

    this.state = {
      windowHeight: 0,
      windowWidth: 0,
      queryImage: null,
      topSites: {},
      elaImage: null,
      isLoading: false
    }

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.onDropImage = this.onDropImage.bind(this);
    this.resetImage = this.resetImage.bind(this);
    this.getHost = this.getHost.bind(this);
    this.getDomain = this.getDomain.bind(this);
    this.ImageAnalysis = this.ImageAnalysis.bind(this);
    this.getImageAnalysis = this.getImageAnalysis.bind(this);
    this.GenerateReport = this.GenerateReport.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.addEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    });
  }

  handleScroll() {
    if ( (document.body.scrollTop > (this.state.windowHeight - 1) || document.documentElement.scrollTop > (this.state.windowHeight - 1))  &&  (document.body.scrollTop < (this.state.windowHeight * 2) || document.documentElement.scrollTop < (this.state.windowHeight * 2)) ) {
      document.getElementById("upBtn").style.display = "block";
    }
    else {
      document.getElementById("upBtn").style.display = "none";
    }
  }

  onDropImage(dropped_file) {
    this.setState({
      queryImage: dropped_file
    });
    console.log(this.state.queryImage)
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
    domain = domain.split('.')
    return domain[0];
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
          topSites: data,
          isLoading: false
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
      <a href={url}><Button id="websiteLinkButton" bsStyle="default">{this.getDomain(url)}</Button></a>
    );
    buffer.push(
      <div key={0}>
        <img className="elaImage" src={imgsrc} alt='ELA Output' />
        <Grid>
          <Row className="show-grid">
            <Col>
              {listItems[0]}
            </Col>
            <Col>
              {listItems[1]}
            </Col>
            <Col>
              {listItems[2]}
            </Col>
          </Row>
          <Row className="show-grid">
            <Col>
              {listItems[3]}
            </Col>
            <Col>
              {listItems[4]}
            </Col>
            <Col>
              {listItems[5]}
            </Col>
          </Row>
        </Grid>
      </div>
    )
    return (
      <div>
        {buffer}
      </div>
    );
  }

  GenerateReport() {
    this.setState({
      isLoading: true
    });
    this.ImageAnalysis()
  }

  render() {
      return (
        <div className="ImageAnalysis" id="topOfPage">

          <div className="entrypage">
            <Jumbotron className="jumbo">
              <h1 className="header">EXPOSE.i</h1>
              <h4 className="subheader">Helping you find honesty in the internet.</h4>
              <Scrollchor to="analysisLink">
                <Button bsStyle="default" className="downbutton">
                  <Glyphicon className="buttonicon" glyph="chevron-down"/>
                </Button>
              </Scrollchor>
              <p className="navtitle">Begin</p>
            </Jumbotron>
          </div>

          <div className="uploadpage" id="analysisLink">
            <div className="uploadpagecontainer">
              <h2> Upload Image </h2>

              <div className="jumbo">

                <div className="topbutton">
                  <Scrollchor to="topOfPage"><Button id="upBtn" onClick={this.resetImage.bind(this)} bsStyle="default"><Glyphicon glyph="chevron-up" /></Button></Scrollchor>
                </div>

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
                      </div>
                    }
                  </div>
                </div>

                <div className="buttonContainer">
                  {
                    this.state.queryImage !== null
                    ?
                    <div>
                      <Scrollchor to="reportLink">
                        <Button bsStyle="default" className="ImageAnalysisButton" onClick={this.GenerateReport.bind(this)}>
                          <Glyphicon className="buttonicon" glyph="chevron-down"/>
                        </Button>
                      </Scrollchor>
                    </div>
                    // <Button className="ImageAnalysisButton" bsSize="large" onClick={this.ImageAnalysis.bind(this)}>Analyze Image</Button>
                    :
                    <div>
                      <Button bsStyle="default" className="ImageAnalysisButton" onClick={this.GenerateReport.bind(this)} disabled>
                        <Glyphicon className="buttonicon" glyph="chevron-down"/>
                      </Button>
                    </div>
                    // <Button className="ImageAnalysisButton" bsSize="large" onClick={this.ImageAnalysis.bind(this)} disabled>Analyze Image</Button>
                  }
                </div>

              </div>
            </div>

          </div>

          <div className="reportpage" id="reportLink">
            <div className="report">
              {
                this.state.isLoading
                ?
                <img className="loading" src={loadingSpinner} alt='Loading...' />
                :
                <div className="loaded">
                  <h2>Analysis Report</h2>
                  {
                    this.state.queryImage !== null
                    ?
                    <div className="original">
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
                    </div>
                    :
                    null
                  }
                  {
                    Object.keys(this.state.topSites).length !== 0
                    ?
                    <div className="analysis">
                      {this.getImageAnalysis()}
                    </div>
                    :
                    null
                  }
                </div>
              }

            </div>
          </div>

        </div>
      );
  }
}

export default ImageAnalysis;

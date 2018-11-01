import React, { Component } from 'react';
import Header from '../Header/Header.js';
import ImageAnalysis from '../ImageAnalysis/ImageAnalysis.js';

class App extends Component {

  render() {
    return (
      <div className="App">
        <Header />
        <ImageAnalysis />
      </div>
    );
  }
}

export default App;

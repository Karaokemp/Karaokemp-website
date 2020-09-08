import React, {Component, ChangeEvent} from 'react';
import './SongsSearch.css'
import karaokempLogo from '../../pics/logo.png';
import youtubeLogo from '../../pics/youtube-logo.svg';

import YouTube from 'react-youtube';
import BackendState from '../backendState.component'
import Error from '../error.component'

const INTERVAL = 3000

let youtubeOpts:any
youtubeOpts={
  height: '300',
          width: '80%'
}



export default class SongsSearchComponent extends Component<{}, { linkPath: string, selectedVideoID: string,errorMessage:string, requests:Array<string>,readySongs:Array<string>}>{

  constructor(props:string) {
    super(props);
    this.state = {
      linkPath :'',
      errorMessage:'',
      selectedVideoID :'qr-Bq_zKddg',
      requests: new Array<string>(),
      readySongs: new Array<string>()
    }
    if(''){
      console.log('True')
    }else{
          console.log('False')
        }
      
    }
  

  componentDidMount() {
   this.updateBackendState()
  }
  updateBackendState() {
    console.log('update!')
    fetch('http://localhost:4000/state')
    .then(res => res.json())
    .then((backendState) => {
      this.setState({requests:backendState.requests,readySongs: backendState.readySongs})
    }).catch(console.error)
  }

  

  handleLinkPathChange(change:ChangeEvent<HTMLInputElement> ){
    let path = change.target.value

    try {
      let link = new URL(path)
      let videoID = link.searchParams.get('v') || this.state.selectedVideoID
      this.setState({linkPath: link.href,selectedVideoID:videoID})
    } catch (TypeError) {
      let msg = path ? 'Must be valid URL!' : ''      
      this.setState({errorMessage:msg})
    }
  }

  handleRequest(click:any){
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({path: this.state.linkPath})
  };
  fetch('http://localhost:4000/link', requestOptions)
      .then(response => response.json())
      .then((backendState) => {
      this.setState({requests:backendState.requests,readySongs: backendState.readySongs})
      setInterval(this.updateBackendState.bind(this),INTERVAL)
    }).catch(console.error)
}

  render() {
    return(<div className="container">
  <div className="row">
    <div className="col-6 col-lg-6">
      <h1>Welcome to The Karaokemp!</h1>
      <div className="text-center"><img className='big' src={karaokempLogo} alt='' style={{height:'100px'}}/></div> <br/><hr/>
        
        <p className='instructions'>Insert Link from &nbsp;<img src={youtubeLogo}alt=''/>
        <input type="text"  onChange={this.handleLinkPathChange.bind(this)} style={{ width: "80%" }} placeholder='e.g. https://www.youtube.com/watch?v=...'/>
       <Error errorMessage = {this.state.errorMessage}/>
        </p>
        <YouTube videoId={this.state.selectedVideoID} opts = {youtubeOpts}/>
                <button  className="btn btn-primary" onClick={this.handleRequest.bind(this)}>Request song!</button>


        <hr/>

    </div>
    <div className="col-6 col-lg-6">
      <BackendState requests = {this.state.requests} readySongs = {this.state.readySongs}/>
      </div>
  </div>
</div>)
      
  }

}
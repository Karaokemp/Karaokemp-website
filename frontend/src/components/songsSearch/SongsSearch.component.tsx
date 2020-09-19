import React, {Component, ChangeEvent} from 'react';
import {State,YoutubeURL,YoutubeURLTypeError} from '../../types'
import './SongsSearch.css'
import karaokempLogo from '../../pics/logo.png';
import youtubeLogo from '../../pics/youtube-logo.svg';

import ReactPlayer from 'react-player'
import BackendState from '../backendState.component'
import Error from '../error.component'
import ValidMark from '../validMark.component'

const INTERVAL = 3000
const DEFAULT_VIDEO_ID = 'FxyQTb6n4_I'

let youtubeOpts:any
youtubeOpts={
  height: '300',
          width: '80%'
}



export default class SongsSearchComponent extends Component<{}, { linkPath: string, selectedVideoID: string,errorMessage:string,backendState:State|null}>{

  constructor(props:string) {
    super(props);
    this.state = {
      linkPath :'',
      errorMessage:'',
      selectedVideoID :DEFAULT_VIDEO_ID,
      backendState: null
    }
   
  }
  

  componentDidMount() {
   this.updateBackendState()
  }
  updateBackendState() {
    fetch('http://localhost:4000/state')
    .then(res => res.json())
    .then((newBackendState:State) => {
      this.setState({backendState:newBackendState})
    }).catch(console.error)
  }

  handleLinkPathChange(change:ChangeEvent<HTMLInputElement> ){
    let path = change.target.value
    this.setState({linkPath:path})

    try {
      let link = new YoutubeURL(path)
      let videoID = link.searchParams.get('v') || this.state.selectedVideoID
      this.setState({selectedVideoID:videoID})
    } catch (err) {
      let msg;
      if(!path){
        msg = ''
      }else if(err instanceof YoutubeURLTypeError){
        msg = 'Not a Youtube URL!'
      }else if(err instanceof TypeError){
        msg = 'Not a valid URL!'

      }else{
        msg = err.message
      }
      this.setState({errorMessage:msg})
    }
  }

  handleRequest(click:any){
    if(this.state.linkPath.length && !this.state.errorMessage){
      this.sendRequest();
    }else{
      this.setState({errorMessage: "Could not send request!"})
    }

  }

  sendRequest(){
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({path: this.state.linkPath})
  };
  fetch('http://localhost:4000/link', requestOptions)
      .then(response => response.json())
      .then((newBackendState) => {
      this.setState({backendState:newBackendState})
      setInterval(this.updateBackendState.bind(this),INTERVAL)
    }).catch(console.error)
}

onYoutubeReady(event:any){
  event.target.playVideo()
}
onYoutubeChange(event:any){
  //event.target.playVideo()
}

  render() {
    return(<div className="container">
  <div className="row">
    <div className="col-6 col-lg-6">
      <h1>Welcome to The Karaokemp!</h1>
      <div className="text-center"><img className='big' src={karaokempLogo} alt='' style={{height:'100px'}}/></div> <br/><hr/>
        
        <div className='instructions'>Insert Link from &nbsp;<img src={youtubeLogo}alt=''/>
        <input type="text"  onChange={this.handleLinkPathChange.bind(this)} style={{ width: "80%" }} placeholder='e.g. https://www.youtube.com/watch?v=...'/>
        <ValidMark valid={!this.state.errorMessage && this.state.linkPath.length >0 }/>

       <Error errorMessage = {this.state.errorMessage}/>
        </div>
        <ReactPlayer url={`https://www.youtube.com/watch?v=${this.state.selectedVideoID}&vl=en`} />
                <button  className="btn btn-primary" onClick={this.handleRequest.bind(this)}>Request song!</button>


        <hr/>

    </div>
    <div className="col-6 col-lg-6">
      <BackendState state = {this.state.backendState}/>
      </div>
  </div>
</div>)
  }

}
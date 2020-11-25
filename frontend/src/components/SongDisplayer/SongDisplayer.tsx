import { observer } from "mobx-react";
import React,{Component } from "react";
import ReactPlayer from "react-player";
import { JsxElement } from "typescript";
import { Context } from "../../store/store";
import { KaraokempSong, Song } from "../../types";
import './SongDisplayer.css'

const style = {height:'80%',width:'90%'}
@observer
export default class SongDisplayer extends Component<{song:any,onClick:any},{}>{
    static contextType = Context


    render(){
        console.log(this.context.selectedSong)
        let window
        if(this.props.song.cloudUrl){
            window = <ReactPlayer url={this.props.song.cloudUrl} playing controls/>
        }else{
            window = <img src={this.props.song.image} onClick={this.props.onClick} style={style}
            title="click her to store the song"
            className={this.context.processingSelectedSong ? 'processing' : ''}/>
        }
        return (<div>
            <p>{window}</p>
            <h4>{this.props.song.title}</h4>
        </div>)
    }

}
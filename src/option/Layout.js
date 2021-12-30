import React from "react";
import ReactDOM from "react-dom";

import "./option.css";
import Debug from "./debug.js";

import { _storage } from "./../function.js";


const Toggle = (props) => (
	<p class={"switch " + props.cls}>
		<label style={{fontSize:"medium"}}>
			Off
			<input type="checkbox" id={props.id} onChange={props.onChange} checked={props.checked}/>
			<span class="lever"></span>
			On
		</label>
	</p>
)
class Layout extends React.Component {
	constructor() {
		super();
		this.state = {
			'nico-scroll': false,
			'nico-click2play': false,
			saveFlag: false,
		}
		
		_storage.getSync("nico_setting")
		.then(value => {
			if (value.nico_setting) {
				this.setState({...this.state,
					['nico-scroll']: value.nico_setting.scroll,
					['nico-click2play']:value.nico_setting.click2play, 
				})
			}
		})
		
	}
	onChange = (e) => {
		let id = e.target.id
		let value = e.target.checked
		this.setState({...this.state, [id]: value, saveFlag: true})
	}
	save = () => {
		let scroll = this.state['nico-scroll']
		let click2play = this.state['nico-click2play']
		_storage.setSync({"nico_setting": {scroll, click2play}})
		this.setState({...this.state, saveFlag: false})
		M.toast({html: '保存しました!', displayLength: 3000})
	}
	
	
	render() {
		const url = new URL(location.href)
		const debug = url.searchParams.get('debug') == '1'
		
		return (
			<div>
				<center>
					<div id="error_str" style={{color:"#FF0000"}}></div>
				</center>
				
				<div id="main" class="row" style={{fontSize:"large"}}>
					
					<div class="col s12 uline">
						<p class="center">ニコニコ動画</p>
					</div>
					<div class="col s12 uline">
						<p class="col s9">動画が見えるところまで自動スクロール</p>
						<Toggle cls="col s3" onChange={this.onChange} id="nico-scroll" checked={this.state['nico-scroll']}/>
					</div>
					<div class="col s12 uline">
						<p class="col s9">画面クリック再生機能を追加</p>
						<Toggle cls="col s3" onChange={this.onChange} id="nico-click2play" checked={this.state['nico-click2play']}/>
					</div>
					
					<div class="col" style={{marginBottom:"25px"}}></div>
					<div class="col s12 center">
						<p id="save" class="btn red darken-2" 
							onClick={this.save}
							disabled={!this.state.saveFlag}>保存</p>
					</div>
					
					<div class="col" style={{marginBottom:"15px"}}></div>
					<div class="col s12 center">
						<a href="mylist.html" style={{fontSize:"medium"}}>マイリストへ</a>
					</div>
					
					{debug && <Debug />}
				</div>
				
				<div id="load-layer">
					<img src="../img/load.gif" />
				</div>
			</div>
		);
	}
}

ReactDOM.render(
	<Layout />,
	document.querySelector('#app')
);


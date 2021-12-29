import React from "react";

import { downloadJson, uploadJson, _storage } from "./../function.js";

export default class Debug extends React.Component {
	constructor() {
		super();
		this.state = {
			files: []
		}
	}
	
	handleChange = (e) => {
		let index = e.target.dataset.index;
		let files = this.state.files.concat()
		files[index].content = e.target.value
		this.setState({...this.state, files});
	}
	getFileList = () => {
		downloadJson('').then(json => {
			this.setState({...this.state, files: json.files})
		})
	}
	getContent = (e) => {
		let fid = e.target.dataset.fid
		let index = e.target.dataset.index
		
		downloadJson(fid).then(json => {
			let files = this.state.files.concat()
			files[index].content = JSON.stringify(json, null, "\t")
			this.setState({...this.state, files})
		})
	}
	setContent = (e) => {
		let index = e.target.dataset.index
		let params = {
			id: e.target.dataset.fid,
			json: JSON.parse(this.state.files[index].content)
		}
		uploadJson(params).then(json => {
			let files = this.state.files.concat()
			files[index].content = ''
			_storage.setSync({reload:true});
			this.setState({...this.state, files})
		})
		
	}
	
	render() {
		return (
			<div>
				<div class="col" style={{marginBottom:"50px"}}></div>
					
				<div class="col s12 center">
					<p id="get" class="btn" 
						onClick={this.getFileList}>ファイル一覧取得</p>
				</div>
				
				{this.state.files.map((f, i) => {
					const text = !f.content ? 'get' : 'set';
					const click = !f.content ? this.getContent : this.setContent;
					// const def = f.content || ''
					return (
						<div class="col s12 uline" key={f.id}>
							<div class="col s2"><p>{f.name}</p></div>
							<div class="col s2">
								<p class="btn" data-fid={f.id}
									data-index={i} 
									onClick={click}>{text}</p>
							</div>
							<div class="col s8">
								<textarea value={f.content} data-index={i}
									onChange={this.handleChange}></textarea>
							</div>
						</div>
					);
				})}
			</div>
		);
	}
}
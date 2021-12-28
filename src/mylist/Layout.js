import React from "react";
import ReactDOM from "react-dom";

import "./mylist.scss";
import Header from "./header.js";
import Folder from "./folder.js";
import Video  from "./video.js";

import { 
	getData,
	_url, _storage,
	Preloader,
} from "./../function.js";

const ScrollButton = ({selector}) => {
	const toTop = () => {
		let dom = document.querySelector(selector);
		dom.scroll({ behavior: 'smooth', top: 0 })
	};
	const toBtm = () => {
		let dom = document.querySelector(selector);
		dom.scroll({ behavior: 'smooth', top: dom.scrollHeight })
	};
	return (
		<div class="scroll-btn">
			<a title="一番上へ" class="btn-floating btn-large" onClick={toTop}><i class="material-icons">keyboard_arrow_up</i></a>
			<a title="一番下へ" class="btn-floating btn-large" onClick={toBtm}><i class="material-icons">keyboard_arrow_down</i></a>
		</div>
	);
}

class Layout extends React.Component {
	
	constructor() {
		super();
		this.state = {
			preload: true, draw: false,
			edit: 'none',
			data: { // 空として必要な最低限
				folder: [ {id: 'test'} ],
				video: { test: [] }
			},
		}
		getData().then(data => {
			this.data = data;
			this.current = _url.getParam(location.href, 'list') || data.getFolder()[0].id;
			this.setState({preload: false, draw: true, data: data.getAllJson() })
		})
		
		window.onbeforeunload = (e) => {
			if (this.state.edit == 'save') {e.returnValue = "保存せずに閉じる？";}
		}
	}
	
	changeData = async (callback) => {
		await callback(this.data);
		return this.setState({...this.state, data:this.data.getAllJson(), edit: 'save'});
	}
	changeMode = async ({preload, draw, edit}) => {
		let change = {};
		if (preload != void(0)) change['preload'] = preload;
		if (draw != void(0)) change['draw'] = draw;
		if (edit != void(0)) change['edit'] = edit;
		let $ = this;
		return new Promise((resolve, reject) => {
			$.setState({...$.state, ...change}, () => resolve())
		});
	}
	

	
	render() {
		const edit = this.state.edit;
		const data = this.state.data;
		
		return (
			<div>
				<Header
					changeMode={this.changeMode}
					changeData={this.changeData}
					loadData={this.loadData}
					editMode={edit} data={data}
					/>
					
				{this.state.draw && 
					<div>
						<Folder
							mode={edit} data={data}
							current={this.current}
							changeData={this.changeData} />
						<Video
							mode={edit} data={data}
							current={this.current}
							changeData={this.changeData} />
					</div>
				}
				
				<ScrollButton selector="#mylist"/>
				<Preloader active={this.state.preload}/>
			</div>
		);
	}
}

ReactDOM.render(
	<Layout />,
	document.querySelector('#app')
);
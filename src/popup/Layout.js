import React from "react";
import ReactDOM from "react-dom";

import "./popup.css";
import { _storage } from "./../function.js";

class Layout extends React.Component {
	constructor() {
		super();
		this.state = {
			dest: 0,
		}
		const init = async () => {
			let data_id = (await _storage.getSync('data_id')).data_id
			if (!data_id) {
				chrome.tabs.create({url: '/mylist.html'});
				return false;
			}
			this.folder = (await _storage.getLocal('folder')).folder
		}
		init();
		
	}
	componentDidMount() {
		let elems = document.querySelectorAll('select');
		M.FormSelect.init(elems, {classes:"SelectorHelper"});
	}

	
	
	render() {

		const onOpen = () => {
			chrome.tabs.create({url: '/mylist.html'});
		}
		const onDestChange = (e) => {
			this.setState({dest: e.target.value})
		}

		return (
			<div class="main">
				<div class="video-info">
						<div class="open-mylist">
							<a class="btn waves-effect waves-light" onClick={onOpen}>マイリストを表示</a>
						</div>
						<div class="title">
							<span class="">薄翅の国へと至る道</span>
						</div>
						<div class="input-field select">
							<a class="btn waves-effect waves-light">追加</a>
							<select defaultValue="0" class="" onChange={onDestChange}>
								{this.folder.map((f, i) => <option key={i} value={f.id}>{f.name}</option>)}
							</select>
						</div>
						<div class="input-field text">
							<input id="tags" type="text"/>
							<label for="tags">タグ</label>
						</div>
						<div class="input-field text">
							<textarea id="comment" class="materialize-textarea"></textarea>
							<label for="comment">コメント</label>
						</div>
				</div>
			</div>
		);
	}
}

ReactDOM.render(
	<Layout />,
	document.querySelector('#app')
);


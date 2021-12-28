import React from "react";
import ReactDOM from "react-dom";


class Layout extends React.Component {
	constructor() {
		super();
	}
	
	render() {
		return (
			<div>
				<div class="row open-mylist">
					<a class="btn waves-effect waves-light">マイリストを表示</a>
				</div>
				<div class="row ">
					<h5 class="col s12 ">薄翅の国へ至る道</h5>
				</div>
				
				<div class="input-field select ">
					<select value="0" class="">
						<option value="0" disabled>フォルダを選択</option>
						{folder.map((f, i) => <option key={i} value={f.id}>{f.name}</option>)}
					</select>
				</div>
				<div class="input-field textarea">
					<input id="tags" type="text" class="validate" />
					<label for="tags">タグ</label>
				</div>
				<div class="input-field">
					<textarea id="comment" class="materialize-textarea"></textarea>
					<label for="comment">コメント</label>
				</div>
			</div>
		);
	}
}

ReactDOM.render(
	<Layout />,
	document.querySelector('#app')
);


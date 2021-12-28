import React from "react";


export default class Editor extends React.Component {
	constructor() {
		super();
		this.state = {
			dest: 0,
		}
	}
	componentDidMount() {
		let elems = document.querySelectorAll('select');
		M.FormSelect.init(elems, {classes:"SelectorHelper"});
	}
	
	
	
	getCheckedArr() {
		let checked = [...document.querySelectorAll('.video input.checkbox:checked')]
		if (checked.length == 0) throw new Error('チェック0件');
		return checked.map(e => Number(e.id.match(/\d+/)[0]));
	}
	releaseChecked() {
		[...document.querySelectorAll('.video input.checkbox')]
		.forEach(e => e.checked = false);
	}
	copy(val) {
		const current = this.props.current;
		const dest = this.state.dest;
		if (dest == 0 || dest == current) throw new Error('移動先不正');
		
		let indexArr = this.getCheckedArr();
		this.props.changeData(data => {
			data.copyVideo(current, dest, indexArr);
		});
	}
	delete() {
		let indexArr = this.getCheckedArr();
		this.props.changeData(data => {
			data.delVideo(this.props.current, indexArr);
		});
	}
	
	onMove = () => {
		try {
			this.copy();
			this.delete();
			this.releaseChecked();
		} catch(e) { console.log(e.message); }
	}
	onCopy = () => {
		try {
			this.copy();
			this.releaseChecked();
		} catch(e) { console.log(e.message); }
	}
	onDelete = () => {
		try {
			this.delete();
			this.releaseChecked();
		} catch(e) { console.log(e.message); }
	}
	
	render() {
		const Yohaku = () => <div style={{flex:'none', width:'40px'}}></div>;
		const folder = this.props.folder;
		
		// 編集時以外は機能なし
		const onMove = this.props.edit ? this.onMove : null;
		const onCopy = this.props.edit ? this.onCopy : null;
		const onDele = this.props.edit ? this.onDelete : null;
		
		const onDestChange = (e) => {
			this.setState({dest: e.target.value})
		}
		const onAllSelect = (e) => {
			let check = e.target.checked;
			[...document.querySelectorAll('.video input.checkbox')].forEach(i => i.checked = check)
		}
		
		return (
			<div class={"editor " + this.props.edit}>
				<div class="all-select">すべて
					<input id="all-select" type="checkbox" class="checkbox" onChange={onAllSelect}/>
					<label for="all-select"></label>
				</div>
				<Yohaku />
				<div class="input-field">
					<select value="0" onChange={onDestChange}>
						<option value="0" disabled>移動&#047;コピー先を選択</option>
						{folder.map((f, i) => <option key={i} value={f.id}>{f.name}</option>)}
					</select>
				</div>
				<div class="btns">
					<a class="btn waves-effect waves-light" onClick={onMove}>移動</a>
					<a class="btn waves-effect waves-light" onClick={onCopy}>コピー</a>
					<a class="btn separator"></a>
					<a class="btn waves-effect waves-light" onClick={onDele}>削除</a>
				</div>
				<Yohaku />
			</div>
		);
	}
}
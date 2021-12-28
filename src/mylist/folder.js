import React from "react";
import {
	sortableContainer,
	sortableElement,
	sortableHandle,
} from 'react-sortable-hoc';
import {arrayMoveImmutable} from 'array-move';

const DragHandle = sortableHandle(() => 
	<i class="material-icons">drag_handle</i>
);
const SortableItem = sortableElement((props) =>
	<div class={`folder-item ${props.cls}`}>{props.children}</div>
);
const SortableList = sortableContainer((props) =>
	<div class="list">{props.children}</div>
);

export default class Folder extends React.Component {
	constructor() {
		super();
	}
	onSortEnd = ({oldIndex, newIndex}) => {
		this.props.changeData(data => {
			data.sortFolder(oldIndex, newIndex);
		})
	}
	addFolder = () => {
		let name = window.prompt("フォルダ名", "");
		if (name) {
			this.props.changeData(data => {
				data.addFolder(name);
			})
		}
	}
	delFolder = (e) => {
		if (confirm("フォルダの中身も削除されます。\r\n削除しますか？")) {
			let u = e.currentTarget.previousElementSibling.getAttribute('href');
			let list = u.match(/list=(\d+)/)[1];
			
			if (this.props.current == list) {
				alert('表示中のリストは消せないよ！\r\nずるいことしないで！！');
				return;
			}
			this.props.changeData(data => {
				data.delFolder(list);
			})
		}
	}
	
	render() {
		const { data, mode, current } = this.props;
		const edit = (mode != 'none') ? 'edit' : '';
		
		const btn = "btn waves-effect waves-light"
		return (
			<div id="folder" class="z-depth-1">
				<div class="header">
					{!!edit && <div><a class={btn} onClick={this.addFolder}><i class="material-icons">add</i></a></div>}
					<div><a class={btn}><i class="material-icons" style={{transform: 'rotate(90deg)'}}>sync_alt</i></a></div>
				</div>
				<SortableList useDragHandle
					onSortEnd={this.onSortEnd}
					lockAxis='y'
					helperClass="zindex100 z-depth-2">
					
					{data.folder.map((f, i) => {
						const active = current == f.id ? 'active' : ''
						const Tag = active ? 'div' : 'a';
						return (
							<SortableItem key={`item-${i}`} index={i} cls={`${edit} ${active}`}>
								<Tag class="link truncate" href={"mylist.html?list=" + f.id}>{f.name}</Tag>
								<div class="trash" onClick={this.delFolder}><i class="material-icons">delete</i></div>
								<div class="handle"><DragHandle /></div>
							</SortableItem>
						);
					})}
				</SortableList>
			</div>
		);
	}
}
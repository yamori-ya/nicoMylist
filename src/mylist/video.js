import React from "react";
import {
	sortableContainer,
	sortableElement,
	sortableHandle,
} from 'react-sortable-hoc';

import Editor from './editor.js';
import VideoItem from './videoItem.js';

const DragHandle = sortableHandle(() => 
	<i class="material-icons handle">drag_handle</i>
);
const SortableItem = sortableElement(({id, video, edit}) => 
	<VideoItem edit={edit} id={id} video={video} DragHandle={DragHandle} />
);
const SortableList = sortableContainer((props) => 
	<div class={"list " + props.edit}>{props.children}</div>
);

export default class Video extends React.Component {
	componentDidMount() {
		let dp = document.querySelectorAll('.dropdown-trigger');
		let sl = document.querySelectorAll('select');
		M.Dropdown.init(dp, { alignment: 'right', constrainWidth: false });
		M.FormSelect.init(sl, {classes:"SelectorHelper"})
	}
	onSortEnd = ({oldIndex, newIndex}) => {
		let id = this.props.current;
		this.props.changeData(data => {
			data.sortVideo(id, oldIndex, newIndex);
		})
	}
	
	render() {
		const edit = this.props.mode != 'none' ? 'edit' : '';
		const folder = this.props.data.folder;
		const video = this.props.data.video[this.props.current];
		
		return (
			<div id="main">
				<div class="main-left"></div>
				<div class="main-right">
					<Editor
						edit={edit}
						folder={folder}
						current={this.props.current}
						changeData={this.props.changeData} />
					
					<SortableList useDragHandle
						edit={edit}
						onSortEnd={this.onSortEnd}
						lockAxis='y'
						helperClass="video zindex100 z-depth-2">
						
						{video.map((v, i) => 
							<SortableItem key={i} id={'item-'+i} index={i} video={v} edit={edit}/>
						)}
					</SortableList>
				</div>
			</div>
		);
	}
}
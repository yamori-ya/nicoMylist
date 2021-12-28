import React from "react";

export default class VideoItem extends React.Component {
	
	render() {
		
		const { edit, id, video, } = this.props;
		const tags = !video.tag ? [] : video.tag.split(' ');
		const DragHandle = this.props.DragHandle;
		
		return (
			<div class={"item video " + edit}>
				<div class="check">
					<label>
						<input type="checkbox" id={id} class="checkbox" />
						<label for={id}></label>
					</label>
				</div>
				<div class="thumbnail">
					<a target="_blank" href={video.url}><img src={video.thumbnail} /></a>
				</div>
				<div class="info">
					<div class="title">
						<a target="_blank" href={video.url}>{video.title}</a>
					</div>
					<div class="tag">
						{tags.map((tag, i) => <div key={i} class="chip">{tag}</div> )}
					</div>
					<div class="comment">
						<p>{video.comment}</p>
					</div>
				</div>
				<div class="handle-wrapper">
					<DragHandle />
					<i class="dropdown-trigger material-icons" data-target={'drop-' + id}>more_vert</i>
					<ul id={'drop-' + id} class='dropdown-content'>
						<li><a href="">ここから連続再生</a></li>
						<li><a href="">その他メニュー</a></li>
					</ul>
				</div>
			</div>
		);
	}
	
}
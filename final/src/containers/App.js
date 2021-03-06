// Module imports to load in dependencies
// Uses default, named & unnamed imports
import React, {Component, PropTypes} from 'react';
import CommentList from '../components/CommentList';
import CommentForm from '../components/CommentForm';
import 'whatwg-fetch';

// Class definition (formerly React.createClass)
// Module export as default
export default class App extends Component {
    // Static propTypes definition (formerly )
    static propTypes = {
        url: PropTypes.string.isRequired,
        pollInterval: PropTypes.number
    }
    static defaultProps = {
        pollInterval: 5000
    }
    state = {
        comments: []
    }

    componentDidMount() {
        this._loadCommentsFromServer();

        this._pollId = setInterval(
            this._loadCommentsFromServer.bind(this),
            this.props.pollInterval
        );
    }
    componentWillUnmount() {
        clearInterval(this._pollId);
    }

    _loadCommentsFromServer() {
        // fetch API is Promised-based. It first returns a promise containing
        // the response which we handle in the first `then`. If that's successful
        // we handle that JSON data by updating the state (it's the comments).
        // If that fails we use `catch` to handle it and log the error
        fetch(this.props.url)
            .then((res) => res.json())
            .then((comments) => this.setState({comments}))
            .catch((ex) => console.error(this.props.url, ex));
    }
    _handleCommentSubmit(comment) {
        // Optimistically set an id on the new comment. It will be replaced by an
        // id generated by the server. In a production application you would likely
        // not use Date.now() for this and would have a more robust system in place.

        let {comments} = this.state;

        // We want to ensure that we maintain immutability so we can't just set
        // the `id` property of `comment`. We need to clone it first and then set
        // the `id proprety`. So instead of that multi-step property (which would
        // require an additional library like lodash), or using `Object.assign`,
        // we use the spread operator with object literals to do it all in a
        // single statement.
        let newComment = {...comment, id: Date.now()};

        // Similarly we can't just push onto `comments`. We must clone it and then
        // add to it. We could just `.concat(newComment)` or we can use the spread
        // operator.
        let newComments = [...comments, newComment];

        // update the state optimistically
        this.setState({comments: newComments});

        // Same as above except we have to pass options for the POST request.
        // Also in the case of failure we need to go back to the previous set
        // of comments since we updated optimistically
        fetch(this.props.url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(comment)
        })
            .then((res) => res.json())
            .then((resComments) => this.setState({comments: resComments}))
            .catch((ex) => {
                this.setState({comments});
                console.error(this.props.url, ex);
            });
    }

    render() {
        let {comments} = this.state;

        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <CommentList comments={comments} />
                <CommentForm onCommentSubmit={this._handleCommentSubmit.bind(this)} />
            </div>
        );
    }
}

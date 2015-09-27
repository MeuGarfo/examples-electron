import React from 'react/dist/react';

/**
 * Component for application main window.
 */
export default class MainWindow extends React.Component {
  /**
   * Initialize instance.
   *
   * @param {Object} props Properties。
   */
  constructor( props ) {
    super( props );

    this.__onChange = this._onChange.bind( this );
  }

  /**
   * Occurs when a component mounted.
   */
  componentDidMount() {
    this.props.context.sampleStore.onChange( this.__onChange );
  }

  /**
   * Occurs before the component unmounted.
   */
  componentWillUnmount() {
    this.props.context.sampleStore.removeChangeListener( this.__onChange );
  }

  /**
   * Render for component.
   *
   * @return {ReactElement} Rendering data.
   */
  render() {
    return (
      <div className="sample">
        <span
          className="sample__button"
          onClick={ this._onClick.bind( this ) }>
          Click
        </span>
        <span>{ this.props.context.sampleStore.datetime }</span>
        <div className="sample__repository">
          <i className="icon-github"></i> { 'https://github.com/akabekobeko/examples-electron' }
        </div>
      </div>
    );
  }

  /**
   * Occurs when a datetime clicked.
   */
  _onClick() {
    this.props.context.sampleAction.updateDatetime();
  }

  /**
   * Occurs when a store updated.
   */
  _onChange() {
    this.forceUpdate();
  }

  /**
   * Setup for main window.
   */
  static setup( context ) {
    const area = document.querySelector( '.app' );
    if( !( area ) ) { return; }

    React.render( <MainWindow context={ context } />, area );
  }
}

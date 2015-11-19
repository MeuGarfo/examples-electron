import Path          from 'path';
import BrowserWindow from 'browser-window';
import Util          from '../common/Util.js';
import { IPCKeys }   from '../common/Constants.js';

/**
 * Manage the window.
 */
export default class WindowManager {
  /**
   * Initialize instance.
   *
   * @param {Main} context Application context.
   */
  constructor( context ) {
    /**
     * the application's main window.
     * @type {BrowserWindow}
     */
    this._main = null;

    /**
     * Window for the graphic equalizer.
     * @type {BrowserWindow}
     */
    this._graphicEqulizer = null;

    // IPC handlers
    context.ipc.on( IPCKeys.RequestUpdateGraphicEqualizer, this._onRequestUpdateGraphicEqualizer.bind( this ) );
    context.ipc.on( IPCKeys.FinishUpdateGraphicEqualizer, this._onFinishUpdateGraphicEqualizer.bind( this ) );
  }

  /**
   * Get the main window.
   *
   * @return {BrowserWindow} Instance of the main window.
   */
  get mainWindow() {
    return this._main;
  }

  /**
   * Get the graphic equalizer window.
   *
   * @return {BrowserWindow} Instance of the graphic equalizer window.
   */
  get graphicEqulizer() {
    return this._graphicEqulizer;
  }

  /**
   * Setup the main window.
   */
  setup() {
    // Create once
    if( this._main ) { return; }

    this._main = new BrowserWindow( {
      'width': 800,
      'height': 600,
      'min-width': 800,
      'min-height': 480,
      'resizable': true
    } );

    const filePath = Path.join( __dirname, 'main.html' );
    this._main.loadURL( 'file://' + filePath );

    this._main.on( 'closed', () => {
      if( DEBUG ) { Util.log( 'The main window was closed.' ); }

      // Close an other windows
      if( this._graphicEqulizer ) { this._graphicEqulizer.close(); }

      this._main = null;
    } );
  }

  /**
   * Reload the focused window.
   */
  reload() {
    const w = BrowserWindow.getFocusedWindow();
    if( w ) {
      w.webContents.reloadIgnoringCache();
    }
  }

  /**
   * Switch the display of the developer tools window at focused window.
   */
  toggleDevTools() {
    const w = BrowserWindow.getFocusedWindow();
    if( w ) {
      w.toggleDevTools();
    }
  }

  /**
   * Switch the display of the graphic equalizer window.
   */
  toggleGraphicEqualizer() {
    if( this._graphicEqulizer && this._graphicEqulizer.isVisible() ) {
      this._hideGraphicEqualizer();
    } else {
      this._showGraphicEqualizer();
    }
  }

  /**
   * Show ( with create ) the graphic equalizer window.
   */
  _showGraphicEqualizer() {
    if( this._graphicEqulizer ) {
      this._graphicEqulizer.show();
      return;
    }

    if( process.platform === 'darwin' ) {
      this._graphicEqulizer = new BrowserWindow( {
        'width': 360,
        'height': 300,
        'resizable': false,
        'alwaysOnTop': true
      } );

    } else {
      // Add a heigth for menu bar
      this._graphicEqulizer = new BrowserWindow( {
        'width': 380,
        'height': 340,
        'resizable': false,
        'alwaysOnTop': true
      } );
    }

    const filePath = Path.join( __dirname, 'effect-geq.html' );
    this._graphicEqulizer.loadURL( 'file://' + filePath );

    this._graphicEqulizer.on( 'closed', () => {
      if( DEBUG ) { Util.log( 'The graphic equalizer window was closed.' ); }

      this._graphicEqulizer = null;
    } );
  }

  /**
   * Hide the graphic equalizer window.
   */
  _hideGraphicEqualizer() {
    if( this._graphicEqulizer ) {
      this._graphicEqulizer.hide();
    }
  }

  /**
   * Occurs when the graphic equalizer update is requested.
   *
   * @param {IPCEvent}       ev      Event data.
   * @param {Boolean}        connect If true to connect the effector, Otherwise disconnect.
   * @param {Array.<Number>} gains   Gain values.
   */
  _onRequestUpdateGraphicEqualizer( ev, connect, gains ) {
    this._main.webContents.send( IPCKeys.RequestUpdateGraphicEqualizer, connect, gains );
    ev.sender.send( IPCKeys.FinishUpdateGraphicEqualizer );
  }

  /**
   * Occurs when the graphic equalizer update is finished.
   */
  _onFinishUpdateGraphicEqualizer() {
    if( this._graphicEqulizer ) {
      this._graphicEqulizer.webContents.send( IPCKeys.FinishUpdateGraphicEqualizer );
    }
  }
}

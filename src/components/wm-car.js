import { html, css, LitElement, } from 'lit';
import { connect, print, disconnect, } from '../bluetooth';
import { AmbientLight, DirectionalLight, Euler, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import TWEEN from '@tweenjs/tween.js'



class WmCar extends LitElement {

    #width = 600;
    #height = 400;

    #camera = new PerspectiveCamera( 35, this.#width / this.#height, 0.1, 1000 );
    #renderer = new WebGLRenderer();
    #scene = new Scene();
    #loader = new GLTFLoader();

    static properties = {
        // _isConnected: {state: true, },
    };

    cameraTween = new TWEEN.Tween();
    engineTween = new TWEEN.Tween();
    enginehoodTween = new TWEEN.Tween();

    cameraFront;
    cameraTop;
    engine;
    enginehood;

    constructor() {
      super();
      console.log('hello!')
    }
    firstUpdated() {
      const canvas = this.#renderer.domElement;
      canvas.width = this.#width;
      canvas.height = this.#height;

      this.#renderer.setSize( this.#width, this.#height );
      this.#camera.updateProjectionMatrix();
      this.shadowRoot.appendChild( canvas );
      this.#renderer.setClearColor( 'white' );

      this.#loader.loadAsync( '/assets/car.glb').then( gltf => {
        this.#scene.add( gltf.scene );
        this.cameraFront = gltf.scene.getObjectByName( 'camera-front')
        this.cameraTop = gltf.scene.getObjectByName( 'camera-top')
        this.enginehood = gltf.scene.getObjectByName( 'bonnet')
        this.engine = gltf.scene.getObjectByName( 'engine')
        this.#camera.position.copy( this.cameraFront.position );
        this.#camera.lookAt( new Vector3( 0, 0, 0 ));
        console.log( this.enginehood );


        this.cameraTween = new TWEEN.Tween( this.#camera.position );
        this.engineTween = new TWEEN.Tween( this.engine.position );
        this.enginehoodTween = new TWEEN.Tween( this.enginehood.rotation.clone() );
      })
      const ambientLight = new AmbientLight('white', 2);

      const mainLight = new DirectionalLight('white', 5);
      mainLight.position.set(10, 10, 10);
      this.#camera.position.z = 15;
      this.#scene.add( ambientLight, mainLight );
      this.requestFrame();
    }

    static get styles() { return css`
    *, ::after, ::before {
      box-sizing: border-box;
    }
    :host {
        display: block;
    }
    canvas {
        border-radius: 6px;
    }
    `;

    }

    #onOpen = () => {
      this.cameraTween.to( this.cameraTop.position, 2000 )
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        this.#camera.lookAt( new Vector3(0, 0, 0 ));
      })
      .start()

      this.enginehoodTween.to( new Euler( Math.PI, 0, 0, 4 ), 2000 )
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(( values ) => {
        console.log( values )
        this.enginehood.rotation.x =  values.x;
      })
      .delay( 1000 )
      .start()

      this.engineTween.to( new Vector3( this.engine.position.x, 2, this.engine.position.z ), 2000 )
      .easing(TWEEN.Easing.Quadratic.InOut)
      .delay( 1000 )
      .start()
    }

    render() {
        return html`
        <div>
          <button @click="${ this.#onOpen }">Open Engine Hood</button>
        </div>
        `;
    }
    requestFrame = () => {
      requestAnimationFrame( this.requestFrame );
        TWEEN.update();
      this.#renderer.render( this.#scene, this.#camera );
}



}
customElements.define( 'wm-car', WmCar );

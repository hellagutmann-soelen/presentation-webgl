import { html, css, LitElement, } from 'lit';
import { connect, print, disconnect, } from '../bluetooth';
import { AmbientLight, DirectionalLight, Euler, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import TWEEN from '@tweenjs/tween.js'



class WmCube extends LitElement {

    static properties = {
        // _isConnected: {state: true, },
    };

    timeOld = 0;

    constructor() {
      super();
    }
    proj_matrix = [];
    mov_matrix = [];
    gl;
    firstUpdated() {
       /*============= Creating a canvas =================*/
         var canvas = this.shadowRoot.getElementById('canvas');
         this.gl = canvas.getContext('experimental-webgl');

         /*============ Defining and storing the geometry =========*/

         var vertices = [
            -1,-1,-1, 1,-1,-1, 1, 1,-1, -1, 1,-1,
            -1,-1, 1, 1,-1, 1, 1, 1, 1, -1, 1, 1,
            -1,-1,-1, -1, 1,-1, -1, 1, 1, -1,-1, 1,
            1,-1,-1, 1, 1,-1, 1, 1, 1, 1,-1, 1,
            -1,-1,-1, -1,-1, 1, 1,-1, 1, 1,-1,-1,
            -1, 1,-1, -1, 1, 1, 1, 1, 1, 1, 1,-1,
         ];

         var colors = [
            5,3,7, 5,3,7, 5,3,7, 5,3,7,
            1,1,3, 1,1,3, 1,1,3, 1,1,3,
            0,0,1, 0,0,1, 0,0,1, 0,0,1,
            1,0,0, 1,0,0, 1,0,0, 1,0,0,
            1,1,0, 1,1,0, 1,1,0, 1,1,0,
            0,1,0, 0,1,0, 0,1,0, 0,1,0
         ];

         this.indices = [
            0,1,2, 0,2,3, 4,5,6, 4,6,7,
            8,9,10, 8,10,11, 12,13,14, 12,14,15,
            16,17,18, 16,18,19, 20,21,22, 20,22,23
         ];

         // Create and store data into vertex buffer
         var vertex_buffer = this.gl.createBuffer ();
         this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertex_buffer);
         this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

         // Create and store data into color buffer
         var color_buffer = this.gl.createBuffer ();
         this.gl.bindBuffer(this.gl.ARRAY_BUFFER, color_buffer);
         this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);

         // Create and store data into index buffer
         this.index_buffer = this.gl.createBuffer ();
         this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
         this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), this.gl.STATIC_DRAW);

         /*=================== Shaders =========================*/

         var vertCode = 'attribute vec3 position;'+
            'uniform mat4 Pmatrix;'+
            'uniform mat4 Vmatrix;'+
            'uniform mat4 Mmatrix;'+
            'attribute vec3 color;'+//the color of the point
            'varying vec3 vColor;'+

            'void main(void) { '+//pre-built function
               'gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);'+
               'vColor = color;'+
            '}';

         var fragCode = 'precision mediump float;'+
            'varying vec3 vColor;'+
            'void main(void) {'+
               'gl_FragColor = vec4(vColor, 1.);'+
            '}';

         var vertShader = this.gl.createShader(this.gl.VERTEX_SHADER);
         this.gl.shaderSource(vertShader, vertCode);
         this.gl.compileShader(vertShader);

         var fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
         this.gl.shaderSource(fragShader, fragCode);
         this.gl.compileShader(fragShader);

         var shaderProgram = this.gl.createProgram();
         this.gl.attachShader(shaderProgram, vertShader);
         this.gl.attachShader(shaderProgram, fragShader);
         this.gl.linkProgram(shaderProgram);

         /* ====== Associating attributes to vertex shader =====*/
         this.Pmatrix = this.gl.getUniformLocation(shaderProgram, "Pmatrix");
         this.Vmatrix = this.gl.getUniformLocation(shaderProgram, "Vmatrix");
         this.Mmatrix = this.gl.getUniformLocation(shaderProgram, "Mmatrix");

         this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertex_buffer);
         var position = this.gl.getAttribLocation(shaderProgram, "position");
         this.gl.vertexAttribPointer(position, 3, this.gl.FLOAT, false,0,0) ;

         // Position
         this.gl.enableVertexAttribArray(position);
         this.gl.bindBuffer(this.gl.ARRAY_BUFFER, color_buffer);
         var color = this.gl.getAttribLocation(shaderProgram, "color");
         this.gl.vertexAttribPointer(color, 3, this.gl.FLOAT, false,0,0) ;

         // Color
         this.gl.enableVertexAttribArray(color);
         this.gl.useProgram(shaderProgram);

         /*==================== MATRIX =====================*/

         function get_projection(angle, a, zMin, zMax) {
            var ang = Math.tan((angle*.5)*Math.PI/180);//angle*.5
            return [
               0.5/ang, 0 , 0, 0,
               0, 0.5*a/ang, 0, 0,
               0, 0, -(zMax+zMin)/(zMax-zMin), -1,
               0, 0, (-2*zMax*zMin)/(zMax-zMin), 0
            ];
         }

         this.proj_matrix = get_projection(40, canvas.width/canvas.height, 1, 100);

         this.mov_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
         this.view_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

         // translating z
         this.view_matrix[14] = this.view_matrix[14]-6;//zoom

         /*==================== Rotation ====================*/


         /*================= Drawing ===========================*/
         this.requestFrame();
    }

    rotateZ = (m, angle) => {
      var c = Math.cos(angle);
      var s = Math.sin(angle);
      var mv0 = m[0], mv4 = m[4], mv8 = m[8];

      m[0] = c*m[0]-s*m[1];
      m[4] = c*m[4]-s*m[5];
      m[8] = c*m[8]-s*m[9];

      m[1]=c*m[1]+s*mv0;
      m[5]=c*m[5]+s*mv4;
      m[9]=c*m[9]+s*mv8;
    }

    rotateX = (m, angle) => {
      var c = Math.cos(angle);
      var s = Math.sin(angle);
      var mv1 = m[1], mv5 = m[5], mv9 = m[9];

      m[1] = m[1]*c-m[2]*s;
      m[5] = m[5]*c-m[6]*s;
      m[9] = m[9]*c-m[10]*s;

      m[2] = m[2]*c+mv1*s;
      m[6] = m[6]*c+mv5*s;
      m[10] = m[10]*c+mv9*s;
    }

    rotateY = (m, angle) => {
      var c = Math.cos(angle);
      var s = Math.sin(angle);
      var mv0 = m[0], mv4 = m[4], mv8 = m[8];

      m[0] = c*m[0]+s*m[2];
      m[4] = c*m[4]+s*m[6];
      m[8] = c*m[8]+s*m[10];

      m[2] = c*m[2]-s*mv0;
      m[6] = c*m[6]-s*mv4;
      m[10] = c*m[10]-s*mv8;
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

    render() {
        return html`
        <canvas width="600" height="400" id="canvas"></canvas>
        `;
    }
    requestFrame = ( time ) => {
      var dt = time - this.timeOld;
      this.rotateZ(this.mov_matrix, dt*0.005);//time
      this.rotateY(this.mov_matrix, dt*0.002);
      this.rotateX(this.mov_matrix, dt*0.003);
      this.timeOld = time;

      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.depthFunc(this.gl.LEQUAL);
      this.gl.clearColor(0.5, 0.5, 0.5, 0.9);
      this.gl.clearDepth(1.0);

      this.gl.viewport(0.0, 0.0, this.gl.canvas.width, this.gl.canvas.height);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.gl.uniformMatrix4fv(this.Pmatrix, false, this.proj_matrix);
      this.gl.uniformMatrix4fv(this.Vmatrix, false, this.view_matrix);
      this.gl.uniformMatrix4fv(this.Mmatrix, false, this.mov_matrix);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
      this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0);

      requestAnimationFrame( this.requestFrame );
    }

}
customElements.define( 'wm-cube', WmCube );

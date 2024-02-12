# Doing 3D calculations with WebGL

- What is WebGL
- Example of a pure WebGL application
- Libraries for WebGL
- Example with ThreeJS
- Exporting and using models
- Shaders
- Practical example


<wm-tutorial tipps="Benutze die rechte Pfeiltaste ➡ oder wische nach links um zur nächsten Folie zu gelangen. Mit F11 kannst du zum Vollbild Modus wechseln."></wm-tutorial>

---

## What is WebGL?

- Basicially: An API to do 3D with javascript
- Based on OpenGL ES (A subset of OpenGL), designed for embedded systems (smartphones, tablets, etc.)
- The Khronos Group (a group of developers and tech companies) define these standards nowadays

---

## Example of a pure Webgl application

[Rotating cube in WebGL](https://www.tutorialspoint.com/webgl/webgl_cube_rotation.htm)

- Uses the official standard
- We can see the API is designed as a low-level primitive, meaning it is intentionally designed hardly access- and understandable for performance reasons and for framework authors
- You have to manage all calculations, including shading with for exampling light sources and what not by yourself

---

## Libraries for WebGL

In that regard: Working with libraries such as Babylon.js or Three.js makes your life a lot easier

- [Babylon.js](https://www.babylonjs.com/), developed mainly by microsoft, open source
- [Three.js](https://threejs.org/), developed by mr.doob/community, open source

---

## Example with ThreeJS

- [Creating a rotating cube in Three.js](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene)

- [Helmet](https://threejs.org/examples/#webgpu_loader_gltf) (here the [model with texture examples](https://github.com/KhronosGroup/glTF-Sample-Models/tree/main/2.0/DamagedHelmet/glTF))
- [VR Example](https://threejs.org/examples/#webxr_vr_sandbox)
- [Bone animation](https://threejs.org/examples/#webgl_animation_skinning_additive_blending)
- [Morph targets](https://threejs.org/examples/#webgl_morphtargets_face)
- [Animating with curves](https://threejs.org/examples/#webgl_modifier_curve)
- [Performance test](https://threejs.org/examples/?q=performance#webgl_instancing_performance)

---

## Exporting and using models

- Sharing models or custom / complex 3D projects is not easy
- For a long time the best format there was is the .obj format which has limited feature support
- The Khronos Group defined a standard called .collada, an XML based format which was complex and now well defined, meaning different projects which used collada had different implementations
- The "new" GLTF format is better defined with todays standards and can have different formats (json, binary, etc.)

---

## Shaders

- In WebGL / OpenGL ES terms you can create programs which run on the GPU
- With this it is possible to run thousands of processes at the same time/tick (depending of your GPU Power of course)
- Basicially there are 2 parts to form a shader in WebGL: The Vertex and the Fragment shaders
- To get into shading checkout [The book of shaders](https://thebookofshaders.com/) or the [Shaders Basics](https://www.youtube.com/watch?v=kfM-yu0iQBk) course from [Freya Holmér](https://www.youtube.com/@acegikmo)
- Sidenote we also use Shaders! An example can be found in the SDI Application; we do that in order to increase the performance on old devices (calulating a graph in runtime on the gpu instead of the cpu)


---

## Practical example

A quick example how to create a simple interaction with webgl, javascript and some html elements. The sourcecode can be found on the [presentation-webgl](https://github.com/hellagutmann-soelen/presentation-webgl/blob/main/src/components/wm-car.js) github repository.

[Model source](https://3dexport.com/free-3dmodel-2021-honda-odyssey-373199.htm)

<wm-car></wm-car>


---

# Thank you!


In the four subfolders you will find different versions of WebGL
implementations of texture mapping, as we discussed in class this
week. I have also included the notes that we went over together in
class, in the accompanying notes.pdf file.

texture0 is an example of applying a single texture to all objects.

texture1 shows how you can create an array of textures, so that
different objects can have different textures.

texture2 shows how you can add bump mapping. This involves adding
the three values of the tangent vector to the vertex attributes.

I have also added an addition variation in texture3, since a student
in the class asked about using texture mapping to build a text editor.
Here I added the option to use an HTML canvas as a texture source. The
major runtime difference is that because the canvas value continues to
change over time, the draw function in lib.js needs to send a new value
for the texture down to the GPU at every animation frame.

In texture3 I also added check-button.png, an image file that contains
transparent pixels. In index.html I have used it to texture map a
square. The effect in this case is a cutout shape of a check mark.
I have placed that object in front of a yellow sphere, so you can see
how the transparent object selectively blocks the object behind it.

IMPORTANT: Remember that if you mix opaque and transparent objects, you
need to render the transparent objects *after* the opaque objects, so
that the z-buffer will produce the correct result.

----

For your homework this week I would like you to use texture mapping originally and creatively. I recommend that you start from the
texture implementation in texture3 and build from there.

See if you can use it to create the appearance of natural materials,
such as wood or vegetation. For those things, you might want to use
two texture maps together, one for color and the other as a bump map.

If you're ambitious, see whether you can use a 2D canvas as your texture
source, and use it to make something like a text editor or a 3D game.

You can try using texture mapping to vary other properties of
visibility over the surface of objects, such as transparency and
specularity power. You can also get spectacular results by layering
transparent textures back to front.



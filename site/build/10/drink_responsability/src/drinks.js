(function() {

  var root = this;
  var previousDrinks = root.Drinks || {};
  var colors = [
    'rgb(255, 100, 100)',
    '#fff',
    'rgb(100, 255, 100)',
    'rgb(255, 255, 100)',
    'orange',
    '#6dcff6'
  ];

  Two.Resolution = 16;

  var Drinks = root.Drinks = function(two) {

    this._callbacks = [];

    this.two = two;
    this.items = [];
    this.tweens = [];

    this.background = two.makeRectangle(0, 0, two.width, two.height);
    this.background.noStroke();

    var makes = [
      function() {
        return two.makeCircle(0, 0, 1);
      },
      function() {
        return two.makeStar(0, 0, 1, 0.5, Math.floor(Math.random() * 5) + 4);
      },
      function() {
        return two.makeRectangle(0, 0, 2, 1);
      }
    ];

    this.confetti = _.map(_.range(25), function() {

      var c = makes[Math.floor(Math.random() * makes.length)]();
      c.fill = colors[Math.floor(Math.random() * colors.length)];
      c.noStroke();

      c.scale = Math.random() * 5 + two.width / 100;

      c.tweens = {
        translation: new TWEEN.Tween(c.translation)
          .easing(TWEEN.Easing.Circular.Out),
        rotation: new TWEEN.Tween(c)
          .easing(TWEEN.Easing.Sinusoidal.In)
      };

      c.opacity = 0;

      return c;

    }, this);

    this.ready(_.bind(function() {

      this.snow = _.map(_.range(25), function() {

        var circle;
        var radius = Math.max(Math.random(), 0.1) * two.width / 75;
        if (Math.random() > 0.5) {
          circle = two.makeCircle(0, 0, radius);
        } else {
          circle = two.makeStar(0, 0, radius, radius / 2, Math.floor(Math.random() * 3) + 5);
          circle.velocityRotation = Math.random() * Math.PI / 100 - Math.PI / 200;
        }

        circle.translation.x = Math.random() * ((two.width / 2) - radius * 2) - (two.width / 4) + radius;
        circle.translation.y = Math.random() * two.height - two.height / 2;
        circle.velocity = Math.random() / 10 + 0.1;
        circle.radius = radius;

        circle.stroke = 'rgba(255, 255, 255, 0.5)';
        circle.linewidth = 3;
        circle.opacity = 0.5;

        return circle;

      }, this);

    }, this));

    two.scene.translation.set(two.width / 2, two.height * 0.85);
    two.scene.scale = 2;

    var ready = _.after(Drinks.Exclamations.length + Drinks.Names.length * 2, _.bind(function() {

      _.each(this._callbacks, function(c) {
        c();
      });
      this._callbacks.length = 0;
      this._ready = true;

    }, this));

    _.each(Drinks.Names, function(name) {

      var scope = this;
      var onload = function(elem) {

        elem.center();

        var rect = elem.getBoundingClientRect();

        elem.id = [this, name].join('-');
        elem.visible = false;
        elem.translation.x = - two.width;
        elem.translation.oy = elem.translation.y = - rect.height / (2 * two.scene.scale);
        elem.rect = rect;

        var dim = rect.width / (2 * two.scene.scale);
        var shadow = elem.shadow = two.makeEllipse(0, 0, - dim, dim / 8);
        shadow.noStroke().fill = 'rgba(0, 0, 0, 0.1)';

        elem.translation.bind(Two.Events.change, function() {
          shadow.translation.x = elem.translation.x;
        });

        shadow.translation.x = elem.translation.x;

        two.scene.add(elem);
        scope.items.push(elem);
        ready();

      };

      two.load('./images/glasses/' + name + '.svg', _.bind(onload, 'glass'));
      two.load('./images/bottles/' + name + '.svg', _.bind(onload, 'bottle'));

    }, this);

    this.exclamations = [];
    this.exclamations.index = 0;
    this.exclamations.next = _.bind(function() {
      var i = (this.exclamations.index + 1) % this.exclamations.length;
      this.exclamations.index = i;
      return this.exclamations[i];
    }, this);

    _.each(Drinks.Exclamations, function(name) {

      var scope = this;
      var onload = _.bind(function(elem) {

        elem.center();
        // elem.scale = 0;
        elem.visible = false;

        elem.tweens = {
          i: new TWEEN.Tween(elem)
            .easing(TWEEN.Easing.Elastic.Out),
          o: new TWEEN.Tween(elem)
            .easing(TWEEN.Easing.Elastic.In)
        };

        elem.show = function(x, y) {

          elem.translation.set(x, y);
          elem.scale = 0;
          elem.visible = true;

          var direction = Math.random() > 0.5;
          var r = Math.random() > 0.5 ? Math.PI * 0.25 : - Math.PI * 0.25;
          elem.rotation = r - (direction ? Math.PI : - Math.PI);

          elem.tweens.i
            .to({ scale: 1 + Math.random() * 0.5 - 0.25, rotation: r }, 500)
            .onComplete(function() {
              elem.tweens.o.start();
            })
            .start();
          elem.tweens.o
            .to({ scale: 0 }, 350)
            .delay(150)
            .onComplete(function() {
              elem.visible = false;
            });

          return elem;

        };

        this.exclamations.push(elem);
        ready();

      }, this);

      two.load('./images/exclamations/' + name + '.svg', onload);

    }, this);

  };

  Drinks.Exclamations = ['ahhh', 'boom', 'd-lish', 'sabor', 'woot', 'yum'];

  Drinks.Names = ['beer', 'champagne', 'cognac', 'gin', 'liquer', 'red-wine',
    'rum', 'tequila', 'vermouth', 'vodka', 'whiskey', 'white-wine'];

  Drinks.Easing = {

    Back: {

      Out: function (k) {
        var s = 1.00125;
        return --k * k * ((s + 1) * k + s) + 1;
      }

    }

  };

  Drinks.prototype = {

    __init: true,
    _ready: false,

    ready: function(f) {
      if (this._ready) {
        f();
        return this;
      }
      this._callbacks.push(f);
      return this;
    },

    update: function() {

      var height = this.two.height;

      for (var i = 0; i < this.snow.length; i++) {
        var flake = this.snow[i];
        flake.translation.y += flake.velocity;
        if (flake.velocityRotation) {
          flake.rotation += flake.velocityRotation;
        }
        if (flake.translation.y > height / 2 + flake.radius) {
          flake.translation.y = - (height / 2 + flake.radius * 2);
        }
      }

      return this;

    },

    select: function(id) {

      var scope = this;
      var index = id;

      if (_.isString(id)) {
        index = this.getIndexByName(id);
      }

      var two = this.two;
      var i = this.items[index];
      var direction = Math.random() > 0.5;

      for (var j = 0; j < this.tweens.length; j++) {
        this.tweens[j].stop();
      }
      this.tweens.length = 0;

      _.each(this.items, function(item) {

        if (!item.visible) {
          return;
        }

        this.tweens.push(
          new TWEEN.Tween(item.translation)
          .to({ y: - two.height }, 500)
          .easing(TWEEN.Easing.Quintic.In)
          .onComplete(function() {
            item.translation.x = - two.width;
            item.translation.y = item.translation.oy;
            item.visible = false;
          })
          .start()
        );

      }, this);

      i.translation.x = direction ? - two.width : two.width;
      i.translation.y = i.translation.oy;
      i.visible = true;

      this._i = new TWEEN.Tween(i.translation)
        .delay(510)
        .onStart(function() {

          i.translation.x = direction ? - two.width : two.width;
          i.translation.y = i.translation.oy;
          i.visible = true;

          var ex = Math.random() * two.width / 4 - two.width / 8;
          var ey = Math.random() * two.height / 4 - two.height / 8 - two.height * 0.15;

          if (!scope.__init && scope.__onStart) {
            scope.exclamations.next().show(ex, ey);
            scope.__onStart();
          }
          scope.__init = false;

        })
        .to({ x: 0 }, 350)
        .easing(Drinks.Easing.Back.Out)
        .onComplete(_.bind(function() {
          this.items.index = index;
        }, this))
        .start();

      this.explode();

      this.tweens.push(this._i);

      return this;

    },

    explode: function() {

      if (_.isUndefined(this.items.index)) {
        return;
      }

      var rect = this.items[this.items.index].rect;
      var radius = two.width / 3;

      for (var i = 0; i < this.confetti.length; i++) {

        var c = this.confetti[i];
        c.translation.clear();
        c.translation.y -= rect.height / 4;
        c.opacity = 1;

        var theta = Math.random() * Math.PI * 2;
        var r = (Math.random() * radius / 2 + radius / 2);
        var x = r * Math.cos(theta) + c.translation.x;
        var y = r * Math.sin(theta) + c.translation.y;

        c.tweens.translation
          .to({ x: x, y: y }, 350)
          .start()
        c.tweens.rotation
          .to({ opacity: 0, rotation: Math.random() * Math.PI * 4 }, 350)
          .start();

      }

      if (!this.__init && _.isFunction(this.__onExplode)) {
        this.__onExplode();
      }

      return this;

    },

    getIndexByName: function(name) {

      for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        if (item.id === name) {
          return i;
        }
      }

      return -1;

    }

  };

})();
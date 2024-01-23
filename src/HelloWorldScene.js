import Phaser from "phaser";

export default class HelloWorldScene extends Phaser.Scene {
  constructor() {
    super("hello-world");
  }

  tourButton;
  buyButton;

  bet = 10;

  truck;
  truckCanLerp = false;
  truckLerpStep = 0;

  box;
  boxGroup = [];

  realTruckLoad = 0;
  currentTruckLoad = 0;
  truckLoadText;

  boxLoadSequence = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  nextBoxIndex = 0;

  boxCount = 0;
  boxCountText;

  winAmmount = 0;
  winAmmountText;

  preload() {
    this.loadFont("troika", "assets/troika.otf");

    this.load.baseURL = "assets/";

    this.load.image("BG", "Background.png");
    this.load.image("UI", "UI.png");
    this.load.image("Truck", "Truck.png");
    this.load.image("TourButton", "TourButton.png");
    this.load.image("BuyButton", "BuyButton.png");
    this.load.image("Box", "Box.png");
    this.load.image("Success", "Success.png");
    this.load.image("Overloaded", "Overloaded.png");
  }

  create() {
    this.add.image(0, 0, "BG").setOrigin(0, 0);
    this.add.image(0, 3240, "UI").setOrigin(0, 1);

    this.createTruck();

    this.createBoxCountText();

    this.createWinAmmountText();

    this.createBuyButton();
    this.createTourButton();

    this.reloadValues();
  }

  update(time, delta) {
    this.LerpBoxes(delta);
    this.lerpTruck(delta);
    if (this.currentTruckLoad < this.realTruckLoad) {
    }
  }

  createTruck() {
    this.truck = this.add.image(850, 1600, "Truck");
    this.truck.setDepth(5);
    this.truckLoadText = this.add.text(
      370,
      1400,
      `${this.currentTruckLoad}/10kg`,
      {
        fontSize: "80px",
        fontFamily: "troika",
        stroke: "#000000",
        strokeThickness: 15,
      }
    );
    this.truckLoadText.setDepth(6);
  }

  createBoxCountText() {
    this.boxCountText = this.add.text(800, 500, "", {
      fontSize: "90px",
      fontFamily: "troika",
      stroke: "#000000",
      strokeThickness: 15,
    });
  }

  createWinAmmountText() {
    this.winAmmountText = this.add.text(810, 1200, "", {
      fontSize: "200px",
      fontFamily: "troika",
      stroke: "#000000",
      strokeThickness: 30,
    });

    this.winAmmountText.setOrigin(0.5, 0.5);

    this.winAmmountText.setDepth(7);
  }

  createBuyButton() {
    this.buyButton = this.add.image(450, 2750, "BuyButton");
    this.buyButton.setInteractive();
    this.buyButton.on("pointerdown", () => {
      this.SpawnBox();
    });
  }

  createTourButton() {
    this.tourButton = this.add.image(1200, 2750, "TourButton");
    this.tourButton.setInteractive();
    this.tourButton.on("pointerdown", () => {
      this.StartTour();
    });
  }

  BuyBox() {
    // Spawn box animation
    // Add cargo load
    // Fill cargo bar
    // If cargo bar full DEFEAT
  }

  SpawnBox() {
    this.box = this.add.sprite(600, 700, "Box").setScale(0.6, 0.6);
    let loadIndex = Phaser.Math.Between(0, this.boxLoadSequence.length - 1);
    this.boxGroup.push({
      gameObject: this.box,
      canLerp: false,
      lerpStep: 0,
      load: this.boxLoadSequence[loadIndex],
    });

    this.boxCount++;

    this.boxCountText.text = this.boxCount;

    // this.time.delayedCall(400, () => {
    //   this.boxCanLerp = true;
    // });
  }

  LerpBoxes(delta) {
    this.boxGroup.forEach((element, index) => {
      if (!element.canLerp) return;

      element.lerpStep += delta / 1000;

      element.gameObject.y = this.lerp(700, 1600, element.lerpStep);

      if (element.lerpStep >= 1) {
        element.canLerp = false;
        element.lerpStep = 0;
        element.gameObject.destroy();
        this.AddTruckLoad(element.load);
        if (index === this.boxGroup.length - 1) {
          this.roundFinished();
        }
      }
    });
  }

  AddTruckLoad(load) {
    this.realTruckLoad += load;
    this.nextBoxIndex++;
    this.truckLoadText.text = `${this.realTruckLoad}/10kg`;
  }

  StartTour() {
    this.LoadBoxes();
    // Add new truck
    // recalculate RNG
    // Show won money
  }

  LoadBoxes() {
    for (let i = 0; i < this.boxGroup.length; i++) {
      this.time.delayedCall(500 * i, () => {
        this.boxGroup[i].canLerp = true;
        this.boxCount--;
        this.boxCountText.text = this.boxCount;
      });
    }
  }

  lerpTruck(delta) {
    if (!this.truckCanLerp) return;

    this.truckLerpStep += delta / 2500;

    this.truck.x = this.lerp(850, 2500, this.truckLerpStep);
    this.truckLoadText.x = this.lerp(370, 2020, this.truckLerpStep);

    if (this.truckLerpStep >= 1) {
      this.showWin();
      this.truckCanLerp = false;
      this.truckLerpStep = 0;
    }
  }

  showWin() {
    let multiplier;

    switch (this.boxGroup.length) {
      case 1:
        multiplier = 1.08;
        break;
      case 2:
        multiplier = 1.93;
        break;
      case 3:
        multiplier = 4.14;
        break;
      case 4:
        multiplier = 11.3;
        break;
      case 5:
        multiplier = 32.79;
        break;
      case 6:
        multiplier = 121.95;
        break;
      case 7:
        multiplier = 250.0;
        break;
      case 8:
        multiplier = 1000.0;
        break;
      case 9:
        multiplier = 5000.0;
        break;
      case 10:
        multiplier = 10000.0;
        break;
    }

    this.winAmmount = multiplier * this.bet;
    this.winAmmountText.text = `Win: ${this.winAmmount}`;
  }

  roundFinished() {
    this.boxCountText.text = "";

    if (this.realTruckLoad <= 10) {
      this.add
        .image(750, 700, "Success")
        .setScale(0.7, 0.7)
        .setOrigin(0.5, 0.5);

      this.time.delayedCall(200, () => {
        this.truckCanLerp = true;

      this.time.delayedCall(4000, () => {
          this.scene.restart();
        });
      });
    } else {
      this.add
        .image(750, 700, "Overloaded")
        .setScale(0.6, 0.6)
        .setOrigin(0.5, 0.5);

        this.time.delayedCall(1500, () => {
          this.scene.restart();
        });
    }

    
  }

  lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }

  reloadValues() {
    this.truckCanLerp = false;
    this.truckLerpStep = 0;

    this.boxGroup = [];

    this.realTruckLoad = 0;
    this.currentTruckLoad = 0;

    this.boxLoadSequence = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    this.nextBoxIndex = 0;

    this.boxCount = 0;

    this.winAmmount = 0;
  }

  loadFont(name, url) {
    var newFont = new FontFace(name, `url(${url})`);
    newFont
      .load()
      .then(function (loaded) {
        document.fonts.add(loaded);
      })
      .catch(function (error) {
        return error;
      });
  }
}

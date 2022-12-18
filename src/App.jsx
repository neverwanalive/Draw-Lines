import React, { useState, useEffect, useReducer } from "react";
import { SketchPicker } from "react-color";
import { Form } from "react-bootstrap";
import { Main, Container } from "./App.styles";

const DEFAULT_WIDTH = 900;
const DEFAULT_HEIGHT = 500;

export const App = () => {
  const [ctx, setCtx] = useState(null);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [imageData, setImageData] = useState(null);
  const [figure, setFigure] = useState("Line");
  const [startPoint, setStartPoint] = useState({
    x: 200,
    y: 200,
  });
  const [endPoint, setEndPoint] = useState({
    x: 0,
    y: 0,
  });
  const [firstlineLength, setFirstlineLength] = useState(100);
  const [secondlineLength, setSecondlineLength] = useState(100);
  const [firstlineSpeed, setFirstlineSpeed] = useState(0);
  const [secondlineSpeed, setSecondlineSpeed] = useState(0);
  const [lineColor, setLineColor] = useState({
    r: 255,
    g: 0,
    b: 0,
    a: 1,
  });
  const [centerPoint, setCenterPoint] = useState({
    x: 200,
    y: 200,
  });
  const [axis, setAxis] = useState({
    x: 200,
    y: 200,
  });
  const [firstlineIsClock, setFirstlineIsClock] = useState(false);
  const [secondlineIsClock, setSecondlineIsClock] = useState(false);
  const [firstlineAngle, setFirstlineAngle] = useState(0);
  const [secondlineAngle, setSecondlineAngle] = useState(0);
  const [time, setTime] = useState(Date.now());

  const handleDraw = () => {
    const time1 = Date.now();
    const deltaTime = (time1 - time) / 1000;
    setTime(time1);
    for (let i = 0; i < imageData.data.length; i++) {
      imageData.data[i] = 0;
    }
    if (figure === "Line") lineDraw(deltaTime);
    if (figure === "Polygon") polygonDraw();
    if (figure === "Elipse") elipseDraw();
    ctx.putImageData(imageData, 0, 0);
    forceUpdate();
  };

  const setPixel = (color, x, y) => {
    if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) return;
    const i = (y * imageData.width + x) * 4;
    imageData.data[i] = color?.r;
    imageData.data[i + 1] = color?.g;
    imageData.data[i + 2] = color?.b;
    imageData.data[i + 3] = color?.a * 255;
  };

  const line = (color, { x: x1, y: y1 }, { x: x2, y: y2 }) => {
    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);
    let sx = x1 < x2 ? 1 : -1;
    let sy = y1 < y2 ? 1 : -1;
    let error = 0;
    let x = x1;
    let y = y1;
    while (Math.abs(x - x2) >= 1 || Math.abs(y - y2) >= 1) {
      setPixel(color, x, y);
      let e_x = error - dy;
      let e_y = error + dx;
      let e_xy = error + dx - dy;
      if (Math.abs(e_x) <= Math.abs(e_y)) {
        if (Math.abs(e_x) <= Math.abs(e_xy)) {
          x += sx;
          error = e_x;
        } else {
          x += sx;
          y += sy;
          error = e_xy;
        }
      } else {
        if (Math.abs(e_y) <= Math.abs(e_xy)) {
          y += sy;
          error = e_y;
        } else {
          x += sx;
          y += sy;
          error = e_xy;
        }
      }
    }
  };

  const lineDraw = (deltaTime) => {
    let endX = startPoint.x + firstlineLength * Math.cos(firstlineAngle);
    let endY = startPoint.y + firstlineLength * Math.sin(firstlineAngle);
    let end2X = Math.round(
      endX -
        Math.sin(firstlineAngle) * endPoint.x +
        Math.cos(firstlineAngle) * endPoint.y
    );
    let end2Y = Math.round(
      endY +
        Math.cos(firstlineAngle) * endPoint.x +
        Math.sin(firstlineAngle) * endPoint.y
    );
    let x2 = Math.round(
      secondlineLength * Math.cos(firstlineAngle + secondlineAngle)
    );
    let y2 = Math.round(
      secondlineLength * Math.sin(firstlineAngle + secondlineAngle)
    );
    line(lineColor, startPoint, { x: endX, y: endY });
    line(
      lineColor,
      { x: end2X - x2, y: end2Y - y2 },
      { x: end2X + x2, y: end2Y + y2 }
    );
    setFirstlineAngle(
      firstlineAngle + (firstlineIsClock ? 1 : -1) * firstlineSpeed * deltaTime
    );
    setSecondlineAngle(
      secondlineAngle +
        (secondlineIsClock ? 1 : -1) * secondlineSpeed * deltaTime
    );
  };

  const elipse = (color, { x: x0, y: y0 }, width, height) => {
    const a = width / 2;
    const b = height / 2;
    const a_sqr = a * a;
    const b_sqr = b * b;
    let error = 0;
    let x = -a;
    let y = 0;
    while (x <= 0 && y <= b) {
      setPixel(color, x0 - x, y0 - y);
      setPixel(color, x0 - x, y0 + y);
      setPixel(color, x0 + x, y0 - y);
      setPixel(color, x0 + x, y0 + y);
      const de_x = (2 * (x + 1) + 1) * b_sqr;
      const de_y = (2 * (y + 1) + 1) * a_sqr;
      const e_x = error + de_x;
      const e_y = error + de_y;
      const e_xy = error + de_x + de_y;
      if (Math.abs(e_x) <= Math.abs(e_y)) {
        if (Math.abs(e_x) <= Math.abs(e_xy)) {
          x += 1;
          error = e_x;
        } else {
          x += 1;
          y += 1;
          error = e_xy;
        }
      } else {
        if (Math.abs(e_y) <= Math.abs(e_xy)) {
          y += 1;
          error = e_y;
        } else {
          x += 1;
          y += 1;
          error = e_xy;
        }
      }
    }
  };

  const elipseDraw = () => {
    elipse(lineColor, centerPoint, axis.x, axis.y);
  };

  const polygon = (color, points) => {
    for (let i = 0; i < points.length - 1; i++) {
      line(color, points[i], points[i + 1]);
    }
    line(color, points[0], points[points.length - 1]);
  };

  const polygonDraw = () => {
    polygon({ r: 255, g: 0, b: 0, a: 255 }, [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 0, y: 50 },
    ]);
    polygon({ r: 0, g: 255, b: 0, a: 255 }, [
      { x: 50, y: 50 },
      { x: 50, y: 150 },
      { x: 150, y: 150 },
      { x: 150, y: 50 },
    ]);
    polygon({ r: 0, g: 0, b: 255, a: 255 }, [
      { x: 300, y: 150 },
      { x: 340, y: 300 },
      { x: 400, y: 400 },
      { x: 600, y: 500 },
      { x: 600, y: 300 },
    ]);
  };

  useEffect(() => {
    if (ctx) {
      const imgDt = ctx.getImageData(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
      setImageData(imgDt);
    }
  }, [ctx]);

  if (ctx && imageData) {
    setTimeout(handleDraw, 60);
  }

  return (
    <Main>
      <Container width="75%">
        <canvas
          ref={(ref) => setCtx(ref?.getContext("2d"))}
          id="canvas"
          width={DEFAULT_WIDTH}
          height={DEFAULT_HEIGHT}
        />
      </Container>
      <Container width="25%" marginTop="10px">
        <Form.Select
          onChange={(e) => setFigure(e.target.value)}
          aria-label="Default select example"
        >
          <option value="Line">Line</option>
          <option value="Polygon">Polygon</option>
          <option value="Elipse">Elipse</option>
        </Form.Select>
        {figure === "Line" && (
          <>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Начальная точка(X)</Form.Label>
              <Form.Control
                value={startPoint.x}
                onChange={(e) =>
                  setStartPoint((currPoint) => ({
                    ...currPoint,
                    x: +e.target.value,
                  }))
                }
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Начальная точка(Y)</Form.Label>
              <Form.Control
                value={startPoint.y}
                onChange={(e) =>
                  setStartPoint((currPoint) => ({
                    ...currPoint,
                    y: +e.target.value,
                  }))
                }
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Конечная точка(X)</Form.Label>
              <Form.Control
                value={endPoint.x}
                onChange={(e) =>
                  setEndPoint((currPoint) => ({
                    ...currPoint,
                    x: +e.target.value,
                  }))
                }
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Конечная точка(Y)</Form.Label>
              <Form.Control
                value={endPoint.y}
                onChange={(e) =>
                  setEndPoint((currPoint) => ({
                    ...currPoint,
                    y: +e.target.value,
                  }))
                }
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Длина первой линии</Form.Label>
              <Form.Control
                value={firstlineLength}
                onChange={(e) => setFirstlineLength(+e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Длина второй линии</Form.Label>
              <Form.Control
                value={secondlineLength}
                onChange={(e) => setSecondlineLength(+e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Скорость 1</Form.Label>
              <Form.Control
                value={firstlineSpeed}
                onChange={(e) => setFirstlineSpeed(+e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Скорость 2</Form.Label>
              <Form.Control
                value={secondlineSpeed}
                onChange={(e) => setSecondlineSpeed(+e.target.value)}
              />
            </Form.Group>
            <Form>
              <Form.Check
                type="switch"
                id="custom-switch"
                label="Направление 1"
                value={firstlineIsClock}
                onChange={(e) => setFirstlineIsClock(e.target.checked)}
              />
            </Form>
            <Form>
              <Form.Check
                type="switch"
                id="custom-switch"
                label="Направление 2"
                value={secondlineIsClock}
                onChange={(e) => setSecondlineIsClock(e.target.checked)}
              />
            </Form>
            <SketchPicker
              color={lineColor}
              onChange={(color) => setLineColor(color.rgb)}
            />
          </>
        )}
        {figure === "Elipse" && (
          <>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Центр(X)</Form.Label>
              <Form.Control
                value={centerPoint.x}
                onChange={(e) =>
                  setCenterPoint((currPoint) => ({
                    ...currPoint,
                    x: +e.target.value,
                  }))
                }
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Центр(Y)</Form.Label>
              <Form.Control
                value={centerPoint.y}
                onChange={(e) =>
                  setCenterPoint((currPoint) => ({
                    ...currPoint,
                    y: +e.target.value,
                  }))
                }
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Ширина</Form.Label>
              <Form.Control
                value={axis.x}
                onChange={(e) =>
                  setAxis((currAxis) => ({ ...currAxis, x: +e.target.value }))
                }
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Высота</Form.Label>
              <Form.Control
                value={axis.y}
                onChange={(e) =>
                  setAxis((currAxis) => ({ ...currAxis, y: +e.target.value }))
                }
              />
            </Form.Group>
            <SketchPicker
              color={lineColor}
              onChange={(color) => setLineColor(color.rgb)}
            />
          </>
        )}
      </Container>
    </Main>
  );
};

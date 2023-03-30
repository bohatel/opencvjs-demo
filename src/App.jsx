import styles from './App.module.css';
import { createEffect, createSignal, For } from "solid-js";
import {Container, Col, Row, Form, Badge, Table} from "solid-bootstrap";
import { OpenCVUitl } from './cv_util';

function App() {
  const cvUtil = new OpenCVUitl("canvasInput", "canvasOutput");
  const [threshold, setThreshold] = createSignal(33);
  const [sizeThreshold, setSizeThreshold] = createSignal(70);
  const [shapes, setShapes] = createSignal([]);

  createEffect(() => {
    cvUtil.setThreshold(threshold());
  });
  createEffect(() => {
    cvUtil.setSizeThreshold(sizeThreshold());
  });

  function selectShapeCallback(s) {
    setShapes(s);
  }
  cvUtil.selectCallback = selectShapeCallback;

  return (
    <div class={styles.App}>
      <header class={styles.header}>
      </header>
      <Container fluid>
        <Row>
          <Col></Col>
          <Col></Col>
          <Col></Col>
        </Row>
        <Row>
          <Col>
            <canvas id="canvasInput"></canvas>
            <Form.Label>Image</Form.Label>
          </Col>
          <Col>
            <canvas id="canvasOutput" onClick={(e) => cvUtil.canvasClick(e)}></canvas>
            <Form.Label>Detected Shapes</Form.Label>
          </Col>
          <Col>
            <Row><Col>
              <input class="form-control" type="file" id="fileInput" name="file" accept="image/*"
                onChange={(e) => {
                  let files = e.target.files;
                  if(files.length > 0) {
                    let imgUrl = URL.createObjectURL(files[0]);
                    cvUtil.loadImage(imgUrl);
                  }
                }}/>
            </Col></Row>
            <Row><Col>
              <Form.Label>Threshold <Badge bg="secondary">{threshold()}</Badge></Form.Label>
              <Form.Range min={0} max={255} value={threshold()}
                onInput={(e) => setThreshold(e.target.value)}/>
            </Col></Row>
            <Row><Col>
              <Form.Label>Size Threshold</Form.Label> 
              <Form.Control value={sizeThreshold()}
                onChange={(e) => setSizeThreshold(e.target.value)}/>
            </Col></Row>
            <Row><Col>
              <Form.Label>Selected Shapes</Form.Label>
              <Table striped bordered hover variant="dark">
                <thead><tr>
                  <th>#</th><th>Area</th><th>Perimeter</th>
                </tr></thead>
                <tbody>
                  <For each={shapes()}>
                    {(row) => {
                      return(
                        <tr>
                          <td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td>
                        </tr>
                      );
                    }}
                  </For>
                </tbody>
              </Table>
            </Col></Row>
          </Col>
        </Row>
     </Container>
   </div>
  );
}

export default App;

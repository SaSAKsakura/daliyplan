function getMinXY(points) {
    if (points == null || points.length === 0) {
      return undefined
    }
    const minXY = [Infinity, Infinity]
    for (const point of points) {
      if (minXY[0] > point[0]) {
        minXY[0] = point[0]
      }
      if (minXY[1] > point[1]) {
        minXY[1] = point[1]
      }
    }
    return minXY
  }
   
  // 将Y轴倒置
  function inversionY(points) {
    if (points == null) {
      return null
    }
    if (points.length === 0) {
      return []
    }
    let maxY = -Infinity
    points.forEach(point => {
      if (maxY < point[1]) {
        maxY = point[1]
      }
    })
    return points.map(point => [point[0], maxY - point[1]])
  }
   
  // 反转Y坐标
  function polygonsInversionY(polygons) {
    if (polygons == null) {
      return null
    }
    if (polygons.length === 0) {
      return []
    }
    let maxY = -Infinity
    polygons.forEach(points => {
      points.forEach(point => {
        if (maxY < point[1]) {
          maxY = point[1]     //层层对比 拿到最大的y值
        }
      })
    })
    return polygons.map(points => points.map(point => [point[0], maxY - point[1]]))
  }
   
  // 获取所有的点中最大的x y坐标
  function getMaxXY(points) {
    if (points == null || points.length === 0) {
      return undefined
    }
    const maxXY = [-Infinity, -Infinity]
    for (const point of points) {
      if (maxXY[0] < point[0]) {
        maxXY[0] = point[0]
      }
      if (maxXY[1] < point[1]) {
        maxXY[1] = point[1]
      }
    }
    return maxXY
  }
   
  function getRectangles(polygons) {
    return polygons.map(polygon => getRectangle(polygon))
  }
  // 将多边形转化为相同宽高的矩形
  function getRectangle(polygon) {
    if (polygon == null) {
      return polygon
    }
    if (polygon.length === 0) {
      return []
    }     
    const ret = [polygon[0][0], polygon[0][1], polygon[0][0], polygon[0][1]];
     
    for (let i = 1; i < polygon.length; i++) {
      const point = polygon[i];
      if (point[0] < ret[0]) {
        ret[0] = point[0];
      } else if (point[0] > ret[2]) {
        ret[2] = point[0];
      }
      if (point[1] < ret[1]) {
        ret[1] = point[1];
      } else if (point[1] > ret[3]) {
        ret[3] = point[1];
      }
    }         
    return ret;
  }
   
  // 点在哪一个多边形内，rectangles是和polygons对应的矩形
  function inPolygons(point, polygons, rectangles) {
    for (let i = 0, len = rectangles.length; i < len; i++) {
      const rectangle = rectangles[i];
      if (
        point[0] >= rectangle[0] &&
        point[0] <= rectangle[2] &&
        point[1] >= rectangle[1] &&
        point[1] <= rectangle[3]
      ) {
        // 点在矩形内
        if (inPolygon(point, polygons[i])) {
          // 点在多边形内
          return i;
        }
      }
    }
    return -1;
  }
  function inPolygon(point, polygon) {
    const p2 = [0, point[1]];
    let p3 = polygon[polygon.length - 1];
    let count = 0;
    let left = 0;
    let top = 0;
    // 对每条边都和射线作对比
    polygon.forEach((p4,index)=>{
      left+=p4[0]
      top+=p4[1]
      p2[0] = (p3[0] < p4[0] ? p4[0] : p3[0]) + 1;
      if (checkCross(point, p2, p3, p4)) {
        count++;
      }
      p3 = p4;
    })
    sessionStorage.setItem('left',(left/4)+10)
    sessionStorage.setItem('top',(top/4))
    return count % 2 === 1;
  }
  // 计算向量叉乘
  function crossMul(v1, v2) {
    return v1[0] * v2[1] - v1[1] * v2[0];
  }
  // 判断两条线段是否相交
  function checkCross(p1, p2, p3, p4) {
    let v1 = [p1[0] - p3[0], p1[1] - p3[1]];
    let v2 = [p2[0] - p3[0], p2[1] - p3[1]];
    let v3 = [p4[0] - p3[0], p4[1] - p3[1]];
    if (crossMul(v1, v3) * crossMul(v2, v3) > 0) {
      return false;
    }
    v1 = [p3[0] - p1[0], p3[1] - p1[1]];
    v2 = [p4[0] - p1[0], p4[1] - p1[1]];
    v3 = [p2[0] - p1[0], p2[1] - p1[1]];
    if (crossMul(v1, v3) * crossMul(v2, v3) > 0) {
      return false;
    }
    return true;
  }
   
  // 求多边形中最短线段的长度
  function getMinSegmentLength(polygon) {
    let p1 = polygon[polygon.length - 1]
    let min
    for (const p2 of polygon) {
      const len = Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]))
      min = len === 0 || (min !== undefined && min < len) ? min : len
      p1 = p2
    }
    return min || 0
  }
   
  // 求两个线段的交点
  function getIntersection(a, b, c, d) {
    /** 1 解线性方程组, 求线段交点. **/
   
    // 如果分母为0 则平行或共线, 不相交
    var denominator = (b[1] - a[1]) * (d[0] - c[0]) - (a[0] - b[0]) * (c[1] - d[1]);
    if (denominator === 0) {
      return false;
    }
   
    // 线段所在直线的交点坐标 (x , y)
    var x =
      ((b[0] - a[0]) * (d[0] - c[0]) * (c[1] - a[1]) +
        (b[1] - a[1]) * (d[0] - c[0]) * a[0] -
        (d[1] - c[1]) * (b[0] - a[0]) * c[0]) /
      denominator;
    var y =
      -(
        (b[1] - a[1]) * (d[1] - c[1]) * (c[0] - a[0]) +
        (b[0] - a[0]) * (d[1] - c[1]) * a[1] -
        (d[0] - c[0]) * (b[1] - a[1]) * c[1]
      ) / denominator;
   
    /** 2 判断交点是否在两条线段上 **/
   
    if (
      // 交点在线段1上
      (x - a[0]) * (x - b[0]) <= 0 &&
      (y - a[1]) * (y - b[1]) <= 0 &&
      // 且交点也在线段2上
      (x - c[0]) * (x - d[0]) <= 0 &&
      (y - c[1]) * (y - d[1]) <= 0
    ) {
      // 返回交点p
      return [x, y];
    }
    // 否则不相交
    return undefined;
  }
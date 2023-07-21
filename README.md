最近做pc的轮播需求时，遇到了一个问题，指示点太多了，可能会超出每个轮播的宽度，于是便参考小红书轮播图的指示点效果，实现了pc版的轮播图，最多显示五个指示点，超出则移动展示。

首先实现指示点的样式，有三种情况： 

* 选中的点索引小于3时，是不需要移动的，第五个指示点开始，都是小号的指示点，条件如下：
```
selectedIndex < 3 && index >= 4
```
* 选中的点索引大于等于3并且小于倒数第三个点的索引时，是需要进行移动的，这个时候，只有中间的三个点是大号的指示点，其它的都是小号的指示点，条件如下：
```
selectedIndex >= 3 &&
selectedIndex < dotTotal - 3 &&
Math.abs(index - selectedIndex) >= 2
```
* 选中的点大于等于倒数第三个点的索引时，是不需要移动的，小于等于倒数第五个点的索引的指示点都是小号的，条件如下：
```
selectedIndex >= dotTotal - 3 && index <= dotTotal - 5
```

然后来处理位移：

只有指示点大于5时，才存在需要移动的情况。这种时候，又需要分为两种情况：

* 当选中的指示点的索引大于当前指示点的索引时，需要往左移，左移的情况又需要分为两种：

   * 选中的指示点的索引小于等于2时，是不需要移动的
        ```
        if (index <= 2) {
          offset = 0;
        }
        ```
    * 选中的指示点的索引大于2时，才需要左移，需要计算将其移动到最中间位置所需要的位移
        ```
        if (index > 2) {
            offset = (index - middleIndex) * 16
        }
        ```

* 当选中的指示点的索引小于当前指示点的索引时，需要往右移动，右移的情况也需要分为两种：

    * 选中的指示点的索引大于等于倒数第三个点的索引时，不需要移动
        ```
        if (index >= dotTotal - 3) {
            offset = 0
        }
        ```

    * 选中的指示点的索引小于倒数第三个点的索引时，才需要往右移动，需要计算将其移动到最中间位置所需要的位移
        ```
        if (index < dotTotal - 3) {
            offset = (index - middleIndex) * 24;
        }
        ```

上述中我们都需要计算将选中的指示点移动到最中间所需要的位移，所以每次移动，我们都需要记录最中间指示点的索引：
```
// 索引小于2时，2始终是最中间的指示点
if (index < 2) {
setMiddleIndex(2);
} else if (index >= 2 && index <= dotTotal - 3) {
// 选中的点需要移动到最中间，即它的索引为最中间的索引
setMiddleIndex(index);
} else {
// 索引大于倒数第三个点时，倒数第三个点始终是最中间的指示点
setMiddleIndex(dotTotal - 3);
}
```

完整代码如下：

App.jsx
```
import { useEffect, useRef, useState } from "react";
import { Carousel } from "antd";
import useWindowSize from "./hooks/useWindowSize";
import "./App.css";

const dataList = [];
for (let i = 0; i < 135; i++) {
  dataList.push({
    label: "label" + i,
    value: "value" + i,
  });
}

export default function CustomPieChartLegend() {
  // 每一行显示多少个
  const [size, setSize] = useState(1);
  // 指示点的个数
  const [dotTotal, setDotTotal] = useState(0);
  // 当前选中的指示点的索引
  const [selectedIndex, setSelectedIndex] = useState(0);
  // 位于最中间的指示点的索引
  const [middleIndex, setMiddleIndex] = useState(0);

  // 当前屏幕的宽度，动态计算每张轮播每一行可显示多少个
  const { width } = useWindowSize();

  const ref = useRef(null);
  const dotRef = useRef(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    // 轮播的宽度
    const clientWidth = ref.current?.clientWidth || 0;
    if (clientWidth > 0) {
      // 最开始选中第一张轮播
      setSelectedIndex(0);

      // 计算当前宽度下没一行可显示多少个，最少1个
      const size = Math.floor(clientWidth / 100) || 1;
      setSize(size);

      // 每张轮播最多可显示 size * 3 个，超过才显示指示点
      if (dataList.length <= size * 3) {
        setDotTotal(0);
      } else {
        // 计算指示点的个数
        const total = Math.ceil(dataList.length / size / 3);
        setDotTotal(total);
        // 最中间的轮播的索引
        if (total > 5) {
          setMiddleIndex(2);
        }
      }
    }
  }, [width]);

  const handleSlide = (index) => {
    // 当前选中的指示点和之前选中的指示点相同，则不做任何操作，返回
    if (index === selectedIndex) return;
    // 指示点偏移位置
    let offset = 24;
    // 只有大于5的时候，指示点才需要移动
    if (dotTotal > 5) {
      // 选中的指示点索引大于当前选中点的索引时，代表需要左移
      if (index > selectedIndex) {
        // 索引小于等于2的指示点，不需要移动
        if (index <= 2) {
          offset = 0;
        } else {
          // 索引大于2的指示点，需要移动至最中间，所以计算到中间指示点的距离
          offset = (index - middleIndex) * 24;
        }
      } else { // 选中的指示点索引小于当前选中点的索引时，代表需要右移
        // 索引小于倒数第三个指示点的索引时，需要移动至最中间，所以计算到中间指示点的距离
        if (index < dotTotal - 3) {
          offset = (index - middleIndex) * 24;
        } else {
          // 索引大于倒数第三个点的索引时，不需要移动
          offset = 0;
        }
      }
      // 索引小于2时，2始终是最中间的指示点
      if (index < 2) {
        setMiddleIndex(2);
      } else if (index >= 2 && index <= dotTotal - 3) {
        // 选中的点需要移动到最中间，即它的索引为最中间的索引
        setMiddleIndex(index);
      } else {
        // 索引大于倒数第三个点时，倒数第三个点始终是最中间的指示点
        setMiddleIndex(dotTotal - 3);
      }

      // 设置平缓滑动动画
      const duration = 1000;
      const frames = (duration / 1000) * 24;
      let frame = 0; // 过渡帧数
      const animate = () => {
        if (!dotRef.current) return;
        dotRef.current.scrollLeft += offset / frames;
        frame += 1;
        if (frame < frames) {
          window.requestAnimationFrame(animate);
        }
      };

      window.requestAnimationFrame(animate);
    }

    carouselRef.current?.goTo(index);
    setSelectedIndex(index);
  };

  return (
    <div ref={ref} className="listBox">
      <Carousel ref={carouselRef} rows={3} slidesPerRow={size} dots={false}>
        {dataList.map((item, index) => (
          <div className="listItem" key={`pie-${index}}`}>
            <div className="listLabel">{item.label}</div>
            <div className="listValue">{item.value}</div>
          </div>
        ))}
      </Carousel>
      <div className="dotWrapper">
        <div className="dotList" ref={dotRef}>
          {new Array(dotTotal).fill({}).map((_, index) => {
            return (
              <div
                className={`dot
                       ${index === selectedIndex && "selectedDot"}
                       ${
                         dotTotal > 5 &&
                         ((selectedIndex < 3 && index >= 4) ||
                           (selectedIndex >= 3 &&
                             selectedIndex < dotTotal - 3 &&
                             Math.abs(index - selectedIndex) >= 2) ||
                           (selectedIndex >= dotTotal - 3 &&
                             index <= dotTotal - 5)) &&
                         "smallDot"
                       }`}
                key={index}
                onClick={() => {
                  handleSlide(index);
                }}
              >
                {index}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

App.css
```
@import '~antd/dist/reset.css';

.listBox{
  width: 30%;
  margin: 100px auto;
}
.listItem{
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;
  border: 1px solid #ccc;
}
.dotWrapper{
  width: 100%;
  display: flex;
  justify-content: center;
}
.dotList{
  width: 108px;
  overflow: hidden;
  white-space: nowrap;
}
.dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 12px;
  background-color: #767684;
  margin-right: 12px;
  font-size: 12px;
  text-align: center;
  line-height: 12px;
  transition: all .2s ease;
  &:last-child {
    margin-right: 0;
  }
}
.selectedDot {
  background: #586ee0;
}
.smallDot {
  transform: scale(0.6);
}
```
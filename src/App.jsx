import { useEffect, useRef, useState } from "react";
import { Carousel } from "antd";
import "./App.css";

export default function CustomPieChartLegend() {
  const [dataList, setDataList] = useState([]);
  // 指示点的个数
  const [dotTotal, setDotTotal] = useState(0);
  // 当前选中的指示点的索引
  const [selectedIndex, setSelectedIndex] = useState(0);
  // 位于最中间的指示点的索引
  const [middleIndex, setMiddleIndex] = useState(0);

  const dotRef = useRef(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    const dataList = [];
    for (let i = 0; i < 10; i++) {
      dataList.push(i);
    }
    setDataList(dataList);
    setDotTotal(dataList.length);
    // 最中间的轮播的索引
    if (dataList.length > 5) {
      setMiddleIndex(2);
    }
  }, []);

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
      } else {
        // 选中的指示点索引小于当前选中点的索引时，代表需要右移
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
      let frame = 0; 
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
    <div  className="listBox">
      <Carousel ref={carouselRef} dots={false}>
        {dataList.map((item) => (
          <div className="listItem">{item}</div>
        ))}
      </Carousel>
      <div className="dotWrapper">
        <div className="dotList" ref={dotRef}>
          {new Array(dotTotal).fill(" ").map((_, index) => {
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

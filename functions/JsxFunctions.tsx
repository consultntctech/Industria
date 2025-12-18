import { MarkElementProps } from "@mui/x-charts";

export const CustomMark = (data: number[]) =>
  function Mark(props: MarkElementProps) {
    const { x, y, color, dataIndex } = props;

    return (
      <g>
        <circle cx={x} cy={y} r={4} fill={color || "currentColor"} />
        <text
          x={x}
          y={Number(y) - 10}
          style={{
            textAnchor: "middle",
            dominantBaseline: "auto",
            fill: color || "currentColor",
            fontWeight: "bold",
            fontSize: 9,
          }}
        >
          {data[dataIndex]?.toString()}
        </text>
      </g>
    );
  };

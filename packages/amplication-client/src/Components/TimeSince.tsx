import React, { useMemo } from "react";
import { Tooltip } from "@primer/components";
import classNames from "classnames";
import { formatDistanceToNow } from "date-fns";
import "./TimeSince.scss";

const CLASS_NAME = "time-since";

export enum EnumTimeSinceSize {
  short = "short",
  Default = "default",
}

type Props = {
  time: Date;
  size?: EnumTimeSinceSize;
};

function TimeSince({ time, size = EnumTimeSinceSize.Default }: Props) {
  const formattedTime = useMemo(() => {
    return formatTimeToNow(time);
  }, [time]);

  return (
    <span className={classNames(CLASS_NAME, `${CLASS_NAME}--${size}`)}>
      <Tooltip className={`${CLASS_NAME}__tooltip`} aria-label={formattedTime}>
        <span className={`${CLASS_NAME}__time`}>{formattedTime}</span>
      </Tooltip>
    </span>
  );
}

export default TimeSince;

function formatTimeToNow(time: Date | null): string | null {
  return (
    time &&
    formatDistanceToNow(new Date(time), {
      addSuffix: true,
    })
  );
}

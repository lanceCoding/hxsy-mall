export function formatTime(timestamp, format = 'Y-M-D h:m:s') {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');

    let formattedTime = format;
    formattedTime = formattedTime.replace('Y', year);
    formattedTime = formattedTime.replace('M', month);
    formattedTime = formattedTime.replace('D', day);
    formattedTime = formattedTime.replace('h', hour);
    formattedTime = formattedTime.replace('m', minute);
    formattedTime = formattedTime.replace('s', second);

    return formattedTime;
}

export function convertTime(milliseconds) {
    // 将毫秒转换为秒
    const totalSeconds = Math.floor(milliseconds / 1000);
    // 计算小时数
    const hours = Math.floor(totalSeconds / 3600);
    // 计算剩余的秒数
    const remainingSecondsAfterHours = totalSeconds % 3600;
    // 计算分钟数
    const minutes = Math.floor(remainingSecondsAfterHours / 60);
    // 计算最终剩余的秒数
    const seconds = remainingSecondsAfterHours % 60;

    // 将小时、分钟和秒数格式化为两位数的字符串
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    // const formattedSeconds = String(seconds).padStart(2, '0');

    // 返回格式化后的时间字符串
    // return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    return `${formattedHours}:${formattedMinutes}`;
}


export async function getCloudImageTempUrl(images) {
    const handledIndexToOriginIndex = new Map();
    const shouldBeHandledImages = [];
    images.forEach((x, index) => {
      if (!x.startsWith('cloud')) return;
  
      const handleIndex = shouldBeHandledImages.length;
      shouldBeHandledImages.push(x);
      handledIndexToOriginIndex.set(handleIndex, index);
    });
  
    const handledImages = (
      await wx.cloud.getTempFileURL({
        fileList: shouldBeHandledImages,
      })
    ).fileList.map((x) => x.tempFileURL);
  
    const ret = [...images];
    handledImages.forEach((image, handleIndex) => (ret[handledIndexToOriginIndex.get(handleIndex)] = image));
  
    return ret;
  }
  
  export async function getSingleCloudImageTempUrl(image) {
    if (!image.startsWith('cloud')) return image;
    return (
      await wx.cloud.getTempFileURL({
        fileList: [image],
      })
    ).fileList[0].tempFileURL;
  }
  
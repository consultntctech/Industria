export const today = () => {
    const date = new Date();
    return date.toISOString().split("T")[0];
}


export const formatDate = (d?: string | Date) =>
  d ? new Date(d).toISOString().split('T')[0] : "";

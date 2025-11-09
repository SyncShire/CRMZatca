import {useList, useNavigation, useDelete} from "@refinedev/core";

import {Show, useModalForm } from "@refinedev/antd";
import {Badge, type BadgeProps, Calendar, Modal,
    Button,} from "antd";
import type {CalendarMode} from "antd/lib/calendar/generateCalendar";
import dayjs from "dayjs";

import type {IEvent} from "../../types/index";
import { EventForm } from "../../components/event/eventForm";

import "./index.css";

export const CalendarPage = () => {
    const {data, refetch} = useList<IEvent>({
        resource: "events",
        pagination: {
            pageSize: 100,
        },
    });

    const { mutate: deleteEvent } = useDelete();

    const {
        show: showCreate,
        modalProps: createModalProps,
        formProps: createFormProps,
    } = useModalForm<IEvent>({
        action: "create",
        resource: "events",
        onMutationSuccess: () => refetch?.(),
    });

    const {
        show: showEdit,
        modalProps: editModalProps,
        formProps: editFormProps,
    } = useModalForm<IEvent>({
        action: "edit",
        resource: "events",
        onMutationSuccess: () => refetch?.(),
    });

    const handleDateSelect = (date: dayjs.Dayjs) => {
        showCreate();
        createFormProps.form?.setFieldsValue({
            date: dayjs(date),
        });
    };

    const handleEventClick = (eventId: number) => {
        showEdit(eventId);
    };

    const getBadgeStatus = (status: string): BadgeProps["status"] => {
        switch (status) {
            case "new":
                return "processing";
            case "done":
                return "success";
            case "cancelled":
                return "error";
            default:
                return "default";
        }
    };


    // const handleDelete = (id: number) => {
    //     Modal.confirm({
    //         title: "Delete Event?",
    //         content: "Are you sure you want to delete this event?",
    //         okText: "Delete",
    //         okType: "danger",
    //         cancelText: "Cancel",
    //         onOk: async () => {
    //             await deleteEvent({ resource: "events", id });
    //             editModalProps.onCancel(); // close modal
    //             refetch?.();
    //         },
    //     });
    // };


    const monthCellRender = (value: dayjs.Dayjs) => {
        const listData =
            data?.data?.filter((p) => dayjs(p.date).isSame(value, "month")) ?? [];
        return listData.length > 0 ? (
            <div className="notes-month">
                <section>{listData.length}</section>
                <span>Events</span>
            </div>
        ) : null;
    };

    const panelChange = (value: dayjs.Dayjs, mode: CalendarMode) => {
        console.log(value.format("DD-MM-YYYY"), mode);
    };

    const dateCellRender = (value: dayjs.Dayjs) => {
        const listData = data?.data?.filter((p) =>
            dayjs(p.date).isSame(value, "day"),
        );
        return (
            <div onClick={() => handleDateSelect(value)} style={{ cursor: "pointer" }}>
            <ul className="events">
                {listData?.map((item) => (
                    <li key={item.id}>
                        <Badge
                            status={getBadgeStatus(item.status)}
                            text={`${item.event_name} - ${dayjs(item.date).format("hh:mm A")}`}
                            onClick={() => handleEventClick(item.id)}
                            style={{ cursor: "pointer" }}
                        />
                    </li>
                ))}
            </ul>
            </div>
        );
    };

    return (
        <>
            <Calendar
                onPanelChange={panelChange}
                dateCellRender={dateCellRender}
                monthCellRender={monthCellRender}
            />
    <Modal
        {...createModalProps}
        title="Create Event"
        okButtonProps={{ form: "create-event-form", htmlType: "submit" }}
        cancelButtonProps={{ onClick: createModalProps.onCancel }}
    >
        <EventForm formProps={{ ...createFormProps, id: "create-event-form" }} />
    </Modal>

    {/* Edit Modal */}
    <Modal
        {...editModalProps}
        title="Edit Event"
        okButtonProps={{ form: "edit-event-form", htmlType: "submit" }}
        cancelButtonProps={{ onClick: editModalProps.onCancel }}
    >
        <EventForm formProps={{ ...editFormProps, id: "edit-event-form" }} />
    </Modal>
            </>
    );
};
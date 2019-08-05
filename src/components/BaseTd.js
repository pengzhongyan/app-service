export default {
    name: "BaseTd",
    functional: true,
    props: {
        render: Function,
        right: Boolean
    },
    render: (h, ctx) => {
        const isTrue = ctx.props.right === true;
        return ctx.props.render(h, isTrue);
    }
};
